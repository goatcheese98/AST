"""Verify actual 200% Chromium zoom using a dedicated cloud-only profile."""
from pathlib import Path
from playwright.sync_api import sync_playwright

out = Path('/workspace/work/ast-browser')
out.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    context = p.chromium.launch_persistent_context(
        '/workspace/work/zoom-settings-profile',
        executable_path='/usr/bin/chromium', headless=True,
        viewport={'width': 1440, 'height': 1000}, args=['--no-sandbox'],
    )
    try:
        page = context.new_page()
        page.goto('chrome://settings/appearance')
        result = page.evaluate('''() => new Promise(resolve =>
            chrome.settingsPrivate.setDefaultZoom(2, () =>
                resolve(chrome.runtime.lastError?.message ?? 'ok')))''')
        assert result == 'ok', result
        page.goto('http://127.0.0.1:4321/recipes/fixture-blt/')
        assert page.evaluate('innerWidth') == 720
        assert page.locator('html').evaluate('(el) => el.scrollWidth <= innerWidth')
        assert page.locator('#written-steps li').count() == 3
        page.get_by_role('button', name='Explore assembly').click()
        page.get_by_role('button', name='Next step').click()
        assert page.get_by_text('Step 2 of 3', exact=True).is_visible()
        page.screenshot(path=str(out / 'recipe-200-percent-zoom.png'), full_page=True)
        print('Actual Chromium zoom 200%, viewport 720, content and controls: passed')
    finally:
        context.close()
