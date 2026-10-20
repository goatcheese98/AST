"""Exercise failure propagation, server cleanup and actual Playwright evidence."""
import os
from pathlib import Path
import socket
import subprocess
import tempfile
import unittest
from unittest.mock import patch
from urllib.parse import urlsplit
import zipfile

from playwright.sync_api import sync_playwright
from browser_support import browser_session, traced_context
import run_browser_ci as harness


class BrowserHarnessTests(unittest.TestCase):
    def test_failed_suite_stops_server_and_preserves_failure(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            fixture = root / 'dist/recipes/fixture-blt/index.html'
            fixture.parent.mkdir(parents=True)
            fixture.write_text('fixture')
            port = []

            def fail_suite(_name, _command, environment, _timeout):
                port.append(urlsplit(environment['AST_BASE_URL']).port)
                raise subprocess.CalledProcessError(42, ['intentional-failure-self-check'])

            with patch.object(harness, 'root', root), patch.object(harness, 'run', fail_suite):
                with self.assertRaises(subprocess.CalledProcessError) as failure:
                    harness.main()
            self.assertEqual(failure.exception.returncode, 42)
            with socket.socket() as client:
                client.settimeout(1)
                self.assertNotEqual(client.connect_ex(('127.0.0.1', port[0])), 0)

    def test_assertion_failure_produces_screenshot_and_trace(self):
        with tempfile.TemporaryDirectory() as directory, patch.dict(os.environ, {
            'AST_BROWSER_ARTIFACTS': directory, 'AST_BASE_URL': 'http://127.0.0.1:4321',
        }):
            with self.assertRaisesRegex(AssertionError, 'intentional-evidence-self-check'):
                with sync_playwright() as playwright, browser_session(playwright) as browser:
                    page = traced_context(browser).new_page()
                    page.set_content('<h1>Fixture-only failure evidence</h1>')
                    raise AssertionError('intentional-evidence-self-check')
            self.assertTrue(list(Path(directory).rglob('*.png')))
            traces = list(Path(directory).rglob('*.zip'))
            self.assertTrue(traces)
            with zipfile.ZipFile(traces[0]) as trace:
                self.assertTrue(any(name.endswith('.trace') for name in trace.namelist()))


if __name__ == '__main__':
    unittest.main()
