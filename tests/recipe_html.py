"""Inspect rendered recipe HTML without executing CMS-supplied markup."""
from html.parser import HTMLParser


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
