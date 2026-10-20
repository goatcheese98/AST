"""Build hostile-text/encoded-ID fixtures through the unchanged anonymous CMS boundary."""
import json
import os
from pathlib import Path
import signal
import subprocess
from urllib.parse import quote
from cloudflare_smoke import main as verify_pages
from recipe_html import Content

ROOT = Path(__file__).resolve().parents[1]


def main():
    evidence = ROOT / 'work/cloudflare-evidence'
    evidence.mkdir(parents=True, exist_ok=True)
    with (evidence / 'rendering-build.log').open('w') as log:
        process = subprocess.Popen(['node', 'tests/build-fixture.mjs', 'rendering'], cwd=ROOT,
                                   stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
        try:
            assert process.wait(timeout=120) == 0, 'Rendering fixture build failed; see rendering-build.log'
        finally:
            if process.poll() is None:
                os.killpg(process.pid, signal.SIGTERM)
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    os.killpg(process.pid, signal.SIGKILL)
                    process.wait(timeout=5)
    fixtures = json.loads((ROOT / 'tests/fixtures/rendering.json').read_text())['data']
    listing = (ROOT / 'dist/recipes/index.html').read_text()
    exports = []
    for path in (ROOT / 'dist/recipes').rglob('index.html'):
        content = Content()
        content.feed(path.read_text())
        exports.append((path, content))
    identities = []
    for recipe in fixtures:
        segment = quote(str(recipe['id']), safe="~!*'()-._")
        matches = [(path, content) for path, content in exports
                   if ''.join(content.headings) == recipe['title']]
        assert len(matches) == 1, f'Recipe must own exactly one export: {recipe["id"]!r}'
        path, content = matches[0]
        assert len(path.parent.name.encode('utf-8')) <= 255, 'Export key exceeds filesystem byte limit'
        assert ''.join(content.steps) == ''.join(recipe['instructions']), content.steps
        public_url = f'/recipes/{segment}/'
        assert f'href="{public_url}"' in listing, 'Original public recipe URL changed'
        identities.append({'id': recipe['id'], 'public_url': public_url,
                           'export_path': path.relative_to(ROOT / 'dist').as_posix()})
    assert len({row['export_path'] for row in identities}) == len(fixtures), 'Shared recipe artifact'
    (evidence / 'recipe-identities.json').write_text(json.dumps(identities, indent=2, ensure_ascii=False) + '\n')
    print('PASS: numeric and encoded recipe routes; CMS title/instruction/image-like strings stay escaped')
    verify_pages(rendering=True, identities=identities)


if __name__ == '__main__':
    main()
