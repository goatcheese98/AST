"""Cloud browser regressions for the previously mistyped logo and slider."""
import os
import re
from pathlib import Path
from playwright.sync_api import sync_playwright

out = Path('/workspace/work/ast-followup/screens')
out.mkdir(parents=True, exist_ok=True)
base = os.environ.get('AST_BASE_URL', 'http://127.0.0.1:4321')

def luminance(color):
    rgb = [int(v) / 255 for v in re.findall(r'\d+', color)[:3]]
    linear = [v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in rgb]
    return sum(a * b for a, b in zip(linear, [.2126, .7152, .0722]))

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for motion in ['no-preference', 'reduce']:
        context = browser.new_context(reduced_motion=motion)
        def local_only(route):
            if route.request.url.startswith(base):
                route.continue_()
            elif route.request.resource_type == 'image':
                route.fulfill(content_type='image/svg+xml', body='<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"/>')
            else:
                route.abort()
        context.route('**/*', local_only)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        for width in [320, 768, 1440]:
            page.set_viewport_size({'width':width, 'height':1000})
            page.goto(base + '/')
            logo = page.get_by_role('group', name='Sando Hub', exact=True)
            logo.wait_for()
            page.wait_for_function("!document.querySelector('.sando-hub-logo-container').closest('astro-island').hasAttribute('ssr')")
            if motion == 'reduce':
                assert logo.locator('.text').evaluate('(el) => el.children.length') == 0
            else:
                page.wait_for_function("document.querySelector('.sando-hub-logo-container .text').children.length > 0")
                logo.hover()
                page.mouse.move(0, 0)
            # Public recipe data and the native link survive the header's hydration.
            page.get_by_role('link', name='The Perfect Classic BLT', exact=True).click()
            assert page.locator('#written-steps li').count() == 3
            page.goto(base + '/gsap-tests/')
            slider = page.locator('.slider-wrapper')
            slider.scroll_into_view_if_needed()
            page.wait_for_function("!document.querySelector('.slider-wrapper').closest('astro-island').hasAttribute('ssr')")
            page.wait_for_function("document.querySelectorAll('.slider-card').length === 5 && Array.from(document.querySelectorAll('.slider-card')).every(el => Number(getComputedStyle(el).opacity) > .99)")
            assert slider.get_by_role('link').count() == 5
            assert slider.get_by_text('Ultimate Grilled Cheese', exact=True).is_visible()
            slider.locator('.slider-track').evaluate('(el) => el.scrollLeft = el.scrollWidth')
            assert slider.get_by_text('Avocado Turkey Club', exact=True).is_visible()
            slider.get_by_role('link', name='Avocado Turkey Club', exact=True).focus()
            assert slider.get_by_role('link', name='Avocado Turkey Club', exact=True).evaluate('(el) => el === document.activeElement')
            focused = slider.get_by_role('link', name='Avocado Turkey Club', exact=True)
            foreground = focused.evaluate('(el) => getComputedStyle(el).color')
            background = focused.evaluate('(el) => getComputedStyle(el.closest(".expanding-recipe-card")).backgroundColor')
            low, high = sorted([luminance(foreground), luminance(background)])
            assert (high + .05) / (low + .05) >= 4.5
            last = focused.bounding_box()
            assert last['x'] >= -1 and last['x'] + last['width'] <= width + 1, last
            if motion == 'reduce':
                assert slider.locator('.slider-card').first.evaluate('(el) => el.style.transform') == ''
                slider.screenshot(path=str(out / f'slider-{width}.png'))
            topdown = page.locator('.top-down-animation-container')
            assert not topdown.evaluate("el => Array.from(el.childNodes).some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim() === 'svelte')")
            assert not errors, errors
        context.close()
    browser.close()
print('Logo/slider: three widths, hydrated/keyboard navigation, normal/reduced motion, no JS errors: passed')
