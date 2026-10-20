"""Own a ready loopback fixture server, bounded browser suites and their logs."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import logging
import os
from pathlib import Path
import subprocess
import sys
from threading import Thread

root = Path(__file__).resolve().parent.parent
artifacts = root / 'work' / 'browser-evidence'
artifacts.mkdir(parents=True, exist_ok=True)
logging.basicConfig(filename=artifacts / 'server.log', level=logging.INFO)


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, message, *arguments):
        logging.info(message, *arguments)


def run(name, command, environment, timeout):
    with (artifacts / f'{name}.log').open('w') as log:
        try:
            result = subprocess.run(command, cwd=root, env=environment, stdout=log, stderr=subprocess.STDOUT, timeout=timeout)
        except subprocess.TimeoutExpired:
            log.write(f'\nSuite exceeded its {timeout}s bound; no retry.\n')
            raise
    print((artifacts / f'{name}.log').read_text(), flush=True)
    result.check_returncode()


def main():
    if not (root / 'dist/recipes/fixture-blt/index.html').is_file():
        raise RuntimeError('Run npm run build:fixture before the browser job')
    # Construction binds and listens synchronously. No readiness polling or sleeps.
    with ThreadingHTTPServer(('127.0.0.1', 0), partial(Handler, directory=str(root / 'dist'))) as server:
        thread = Thread(target=server.serve_forever, daemon=True)
        thread.start()
        environment = {
            **os.environ,
            'AST_BASE_URL': f'http://127.0.0.1:{server.server_port}',
            'AST_BROWSER_ARTIFACTS': str(artifacts),
            'AST_SCREENSHOTS': str(artifacts / 'recipe-screens'),
            'AST_SVELTE_SCREENSHOTS': str(artifacts / 'svelte-screens'),
            'ASTRO_TELEMETRY_DISABLED': '1',
            'PUBLIC_DIRECTUS_URL': '',
        }
        print(f'Fixture server ready at {environment["AST_BASE_URL"]}', flush=True)
        try:
            run('svelte', [sys.executable, 'tests/svelte-regression.py'], environment, 180)
            run('recipe', [sys.executable, 'tests/browser.py'], environment, 180)
            for mode in ['empty', 'malformed', 'unavailable']:
                run(f'build-{mode}', ['node', 'tests/build-fixture.mjs', mode], environment, 120)
                run(f'state-{mode}', [sys.executable, 'tests/states.py', mode], environment, 60)
        finally:
            server.shutdown()
            thread.join(timeout=5)
            if thread.is_alive():
                raise RuntimeError('Fixture server did not stop')
    print('Fixture server stopped; all hosted browser suites passed', flush=True)


if __name__ == '__main__':
    main()
