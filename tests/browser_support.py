"""Pinned-browser setup, loopback isolation, and evidence on assertion failures."""
from contextlib import contextmanager
import os
from pathlib import Path
import sys
from urllib.parse import urlsplit


def traced_context(browser, **options):
    context = browser.new_context(**options)
    context.tracing.start(screenshots=True, snapshots=True, sources=True)
    base = urlsplit(os.environ.get('AST_BASE_URL', 'http://127.0.0.1:4321'))
    if base.scheme != 'http' or base.hostname != '127.0.0.1':
        raise ValueError('Browser suites require a loopback fixture server')

    def loopback_only(route):
        target = urlsplit(route.request.url)
        if target.scheme == base.scheme and target.netloc == base.netloc:
            route.continue_()
        else:
            route.abort()
    context.route('**/*', loopback_only)
    return context


@contextmanager
def browser_session(playwright):
    browser = playwright.chromium.launch(
        executable_path=os.environ.get('AST_CHROMIUM_EXECUTABLE') or None,
        args=['--no-sandbox'],
    )
    try:
        yield browser
    except BaseException:
        destination = Path(os.environ.get('AST_BROWSER_ARTIFACTS', 'work/browser-evidence')) / Path(sys.argv[0]).stem
        destination.mkdir(parents=True, exist_ok=True)
        for index, context in enumerate(browser.contexts):
            for number, page in enumerate(context.pages):
                try:
                    page.screenshot(path=str(destination / f'context-{index}-page-{number}.png'), full_page=True, timeout=3000)
                except Exception as error:
                    print(f'Failure screenshot unavailable: {error}', file=sys.stderr)
            try:
                context.tracing.stop(path=str(destination / f'context-{index}-trace.zip'))
            except Exception as error:
                print(f'Failure trace unavailable: {error}', file=sys.stderr)
        raise
    finally:
        failure_active = sys.exc_info()[0] is not None
        try:
            browser.close()
        except Exception as error:
            if not failure_active:
                raise
            print(f'Browser cleanup failed after the original error: {error}', file=sys.stderr)
