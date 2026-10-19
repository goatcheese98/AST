"""Run against a fixture-built static export served at http://127.0.0.1:4321."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

out = Path(os.environ.get('AST_SCREENSHOTS', '/workspace/work/ast-browser'))
out.mkdir(parents=True, exist_ok=True)
base = 'http://127.0.0.1:4321'
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    context = browser.new_context()
    context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base) else route.abort())
    page = context.new_page()
    errors = []
    failed = []
    console_errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('console', lambda message: console_errors.append(message.text) if message.type == 'error' else None)
    page.on('requestfailed', lambda request: failed.append(request.url))
    for theme in ['light', 'dark']:
        page.emulate_media(color_scheme=theme)
        for width in [320, 390, 768, 1024, 1440]:
            page.set_viewport_size({'width': width, 'height': 1000})
            page.goto(base + '/recipes/')
            page.get_by_role('link', name='The Perfect Classic BLT', exact=True).click()
            page.wait_for_url('**/recipes/fixture-blt/')
            page.evaluate('document.fonts.ready')
            assert page.evaluate("""document.fonts.check('16px "Geist Variable"')""")
            assert page.locator('h1').count() == 1
            assert page.locator('#written-steps li').count() == 3
            assert page.locator('html').evaluate('(el) => el.scrollWidth <= innerWidth'), (theme, width)
            assert page.locator('body').evaluate('(el) => getComputedStyle(el).fontSize') == '16px'
            page.get_by_role('button', name='Explore assembly').wait_for(state='visible')
            button = page.get_by_role('button', name='Explore assembly')
            assert button.bounding_box()['height'] >= 44
            button.focus()
            assert button.evaluate('(el) => el.matches(":focus-visible")')
            page.keyboard.press('Enter')
            previous = page.get_by_role('button', name='Previous step')
            previous.wait_for()
            assert previous.is_disabled()
            page.get_by_role('button', name='Next step').focus()
            page.keyboard.press('Enter')
            assert page.get_by_text('Step 2 of 3', exact=True).is_visible()
            page.get_by_role('button', name='Next step').click()
            assert page.get_by_role('button', name='Next step').is_disabled()
            page.get_by_role('button', name='Previous step').click()
            page.get_by_role('link', name='Return to written steps').click()
            assert page.locator('#written-steps').is_visible()
            page.get_by_role('button', name='Close assembly').click()
            assert not page.get_by_role('button', name='Previous step').is_visible()
            if width in [320, 768, 1440]:
                page.screenshot(path=str(out / f'recipe-{width}-{theme}.png'), full_page=True)
            page.get_by_role('link', name='← All recipes').click()
            assert page.locator('h1').inner_text() == 'All Recipes'
    page.goto(base + '/recipes/fixture-blt/')
    page.keyboard.press('Tab')
    assert page.locator('.skip').evaluate('(el) => el === document.activeElement')
    page.keyboard.press('Enter')
    assert page.locator('#main-content').evaluate('(el) => el === document.activeElement')
    page.emulate_media(reduced_motion='reduce')
    page.get_by_role('button', name='Explore assembly').click()
    page.get_by_role('button', name='Next step').wait_for()
    assert page.evaluate('document.getAnimations().length') == 0
    page.locator('html').evaluate('(el) => el.style.zoom = "2"')
    assert page.locator('html').evaluate('(el) => el.scrollWidth <= innerWidth')
    page.locator('html').evaluate('(el) => el.style.zoom = ""')
    page.goto(base + '/recipes/fixture-no-steps/')
    assert page.get_by_text('Interactive assembly is unavailable for this recipe.').is_visible()
    assert page.get_by_text('Recipe image unavailable', exact=True).is_visible()
    assert page.get_by_role('button', name='Explore assembly').count() == 0
    # Missing fixture image is the only expected failing request on the successful journey.
    assert not errors, errors
    assert len(console_errors) <= 1 and all('Failed to load resource' in e for e in console_errors), console_errors
    assert all('missing-fixture-image' in url for url in failed), failed
    nojs = browser.new_context(java_script_enabled=False)
    static = nojs.new_page()
    static.goto(base + '/recipes/fixture-blt/')
    assert static.locator('#written-steps li').count() == 3
    assert static.locator('#written-steps').is_visible()
    assert not static.get_by_role('button', name='Explore assembly').is_visible()
    # Block only the lazy native assembly chunk, then exercise its retry path.
    failure = browser.new_context()
    pending = []
    failure.route('**/DetailedSandwichAssembly*.js', lambda route: pending.append(route))
    broken = failure.new_page()
    broken.goto(base + '/recipes/fixture-blt/')
    broken.get_by_role('button', name='Explore assembly').click()
    broken.get_by_text('Loading assembly…', exact=True).wait_for()
    assert broken.get_by_role('button', name='Explore assembly').is_disabled()
    assert broken.locator('#assembly-view').get_attribute('aria-busy') == 'true'
    assert broken.locator('#written-steps').is_visible()
    assert pending
    pending[0].abort()
    broken.get_by_text('Assembly could not load.', exact=False).wait_for()
    assert broken.locator('#written-steps li').count() == 3
    assert broken.get_by_role('button', name='Explore assembly').is_enabled()
    failure.unroute('**/DetailedSandwichAssembly*.js')
    # A browser caches failed module imports; reload is required before retrying that URL.
    broken.get_by_role('link', name='Reload recipe to try again').click()
    broken.get_by_role('button', name='Explore assembly').click()
    broken.get_by_role('button', name='Next step').wait_for()
    browser.close()
print(json.dumps({'result':'passed', 'themes':['light','dark'], 'widths':[320,390,768,1024,1440],
    'screenshots':6, 'javascript_errors':errors, 'zoom':'200% CSS reflow', 'expected_missing_image_requests':len(failed)}))
