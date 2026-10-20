"""Build hostile-text/encoded-ID fixtures through the unchanged anonymous CMS boundary."""
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import signal
import subprocess
from urllib.parse import quote
from cloudflare_smoke import main as verify_pages

ROOT = Path(__file__).resolve().parents[1]


class Content(HTMLParser):
    def __init__(self):
        super().__init__()
        self.headings = []
        self.steps = []
        self.heading = False
        self.written = False
        self.step = False
        self.script = False

    def handle_starttag(self, tag, attributes):
        attributes = dict(attributes)
        assert not (tag == 'img' and attributes.get('src') == 'x'), 'CMS markup became an element'
        if tag == 'h1':
            self.heading = True
        if tag == 'ol' and attributes.get('id') == 'written-steps':
            self.written = True
        if tag == 'li' and self.written:
            self.step = True
        if tag == 'script':
            self.script = True

    def handle_endtag(self, tag):
        if tag == 'h1':
            self.heading = False
        if tag == 'ol':
            self.written = False
        if tag == 'li':
            self.step = False
        if tag == 'script':
            self.script = False

    def handle_data(self, text):
        if self.script:
            assert '__cmsXss' not in text, 'CMS text became executable script'
        if self.heading:
            self.headings.append(text)
        if self.step:
            self.steps.append(text)


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
    for recipe, export_path in zip(fixtures, ['73', 'a%2Fb %3F'], strict=True):
        segment = quote(str(recipe['id']), safe="~!*'()-._")
        path = ROOT / 'dist/recipes' / export_path / 'index.html'
        assert path.is_file(), f'Encoded recipe export missing: {path}'
        content = Content()
        content.feed(path.read_text())
        assert ''.join(content.headings) == recipe['title'], content.headings
        assert ''.join(content.steps) == ''.join(recipe['instructions']), content.steps
        assert f'href="/recipes/{segment}/"' in listing, 'Listing URL differs from exported path'
    print('PASS: numeric and encoded recipe routes; CMS title/instruction/image-like strings stay escaped')
    verify_pages(rendering=True)


if __name__ == '__main__':
    main()
