"""Assert static collection state after a no-CMS or matching fixture-mode build."""
import sys
from playwright.sync_api import sync_playwright
expected = 'No recipes yet' if sys.argv[1] == 'empty' else 'Recipes are unavailable'
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page = browser.new_page(viewport={'width':320,'height':900})
    page.goto('http://127.0.0.1:4321/recipes/')
    assert page.get_by_role('heading', name=expected).is_visible()
    assert page.get_by_role('link', name='Back to home').is_visible()
    if sys.argv[1] != 'empty':
        assert page.get_by_role('link', name='Try again').is_visible()
    assert page.locator('html').evaluate('(el) => el.scrollWidth <= innerWidth')
    browser.close()
print(sys.argv[1] + ': static state passed')
