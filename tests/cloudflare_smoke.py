"""Exercise the real Pages local runtime against a fixture static export; never deploy."""
import json
import os
from pathlib import Path
import queue
import re
import signal
import socket
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
EVIDENCE = ROOT / 'work' / 'cloudflare-evidence'


def main(rendering=False):
    assert (DIST / '404.html').is_file(), 'Top-level 404 prevents implicit SPA fallback'
    assert (DIST / 'recipes/fixture-blt/index.html').is_file(), 'Build fixtures first'
    assert not (DIST / '_worker.js').exists(), 'Expected native static export'
    assert (DIST / '_headers').read_bytes() == (ROOT / 'public/_headers').read_bytes()
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    # No provider identity, tokens, .env loading, remote bindings or remote mode.
    allowed = {'PATH', 'HOME', 'TMPDIR', 'SYSTEMROOT', 'HTTP_PROXY', 'HTTPS_PROXY',
               'NO_PROXY', 'http_proxy', 'https_proxy', 'no_proxy', 'NODE_EXTRA_CA_CERTS',
               'SSL_CERT_FILE', 'SSL_CERT_DIR'}
    env = {key: value for key, value in os.environ.items() if key in allowed}
    env.update(CI='true', WRANGLER_SEND_METRICS='false', CLOUDFLARE_CF_FETCH_ENABLED='false',
               XDG_CONFIG_HOME=str(EVIDENCE / 'config'))
    local_config = [*ROOT.glob('.dev.vars*'), *ROOT.glob('.env*')]
    assert not local_config, 'Run Pages smoke from a checkout without local env files'
    command = ['node', 'node_modules/wrangler/bin/wrangler.js', 'pages', 'dev', 'dist',
               '--ip', '127.0.0.1', '--port', '0', '--persist-to', str(EVIDENCE / 'state')]
    log = (EVIDENCE / 'runtime.log').open('w')
    process = subprocess.Popen(command, cwd=ROOT, env=env, stdout=subprocess.PIPE,
                               stderr=subprocess.STDOUT, text=True, start_new_session=True)
    lines = queue.Queue()

    def capture():
        for line in process.stdout:
            log.write(line)
            log.flush()
            lines.put(line)
        lines.put(None)

    reader = threading.Thread(target=capture, daemon=True)
    reader.start()
    base = None
    results = []
    try:
        deadline = time.monotonic() + 60
        while base is None:
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                raise TimeoutError('Pages did not become ready within 60 seconds')
            line = lines.get(timeout=remaining)
            if line is None:
                raise RuntimeError(f'Pages exited before readiness: {process.poll()}')
            match = re.search(r'Ready on (http://127\.0\.0\.1:\d+)', line)
            if match:
                base = match[1]
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))

        def check(path, status, marker=None, method='GET'):
            request = urllib.request.Request(base + path, method=method)
            try:
                response = opener.open(request, timeout=10)
            except urllib.error.HTTPError as error:
                response = error
            with response:
                body = response.read()
                # Persist the failing response too, before any assertion can raise.
                results.append({'path': path, 'method': method, 'status': response.status,
                                'canonical_path': response.url[len(base):],
                                'headers': dict(response.headers)})
                (EVIDENCE / 'responses.json').write_text(json.dumps(results, indent=2) + '\n')
                assert response.status == status, (path, response.status, status)
                assert response.url.startswith(base + '/'), response.url
                for name, value in {
                    'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY',
                    'Referrer-Policy': 'strict-origin-when-cross-origin',
                    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
                    'Cross-Origin-Opener-Policy': 'same-origin',
                    # Pages overrides cache policy on misses; require its safer no-store.
                    'Cache-Control': 'no-store' if status == 404 else 'public, max-age=0, must-revalidate',
                }.items():
                    assert response.headers.get(name) == value, (path, name, response.headers.get(name))
                if marker is not None:
                    assert marker in body, (path, marker)
                if method == 'HEAD':
                    assert body == b''
                return body

        home = check('/', 200, b'Sando')
        browse = check('/recipes/', 200, b'The Perfect Classic BLT')
        detail = check('/recipes/fixture-blt/', 200, b'The Perfect Classic BLT')
        assert home != browse and browse != detail, 'Routes must retain distinct HTML'
        check('/recipes/fixture-blt', 200, b'The Perfect Classic BLT')
        check('/recipes/fixture-blt/index.html', 200, b'The Perfect Classic BLT')
        check('/recipes/fixture-blt/', 200, method='HEAD')
        for path in ['/missing-page', '/recipes/missing-recipe/', '/_astro/missing.js',
                     '/_astro/missing.css', '/favicon-missing.svg']:
            check(path, 404, b'Page not found')
            check(path, 404, method='HEAD')
        asset = next(DIST.glob('_astro/*.css'))
        check('/' + asset.relative_to(DIST).as_posix(), 200, asset.read_bytes()[:30])
        check('/favicon.svg', 200, b'<svg')
        if rendering:
            check('/recipes/73/', 200, b'Numeric recipe')
            check('/recipes/a%2Fb%20%3F/', 200, b'__cmsXss')
        print(f'PASS: {len(results)} real Pages route/header/cache GET/HEAD checks')
    finally:
        if process.poll() is None:
            os.killpg(process.pid, signal.SIGTERM)
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                os.killpg(process.pid, signal.SIGKILL)
                process.wait(timeout=5)
        reader.join(timeout=5)
        log.close()
        if base:
            port = int(base.rsplit(':', 1)[1])
            with socket.socket() as probe:
                probe.settimeout(1)
                assert probe.connect_ex(('127.0.0.1', port)) != 0, 'Pages server leaked'
        print('Pages runtime stopped')


if __name__ == '__main__':
    main(rendering='--rendering' in sys.argv)
