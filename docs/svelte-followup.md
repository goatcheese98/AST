# Full Svelte diagnostics follow-up

Starting point: existing draft PR #1, remote and clean cloud checkout both at `d5230a12a0f54771bb500ae9c1b74e24e5f0f770`. No repository/ancestor AGENTS.md was present. Saved Paper readback and canonical LUM tokens remain unchanged; candidate approval and original Paper PNG remain unavailable.

## Reproduced debt and resolution

The baseline full check exited 1 with exactly 19 errors and 5 warnings. Coordinates below refer to that starting SHA. The strengthened full check now exits 0 with **zero errors and zero warnings**, without suppressions, explicit `any`, non-null assertions or relaxed compiler options.

| Baseline file and line(s) | Count | Cause | Resolution |
| --- | ---: | --- | --- |
| SandoHubLogo.svelte:6,8,9,10,28,127,141,142,143,151 (two),160,169 | 13 errors | Implicit DOM, timeline and SplitText types | Native DOM and library types; a local non-null timeline captured by the character callback; nullable state for lifecycle cleanup |
| FeaturedSlider.svelte:11,21,31,41,51 | 5 errors | Demo data has no difficulty, while the presentation type required it | Difficulty is optional, matching validated CMS metadata; existing N/A display remains. No invented difficulty values |
| FeaturedSlider.svelte:100 | 1 error | Svelte component instance bound as HTMLElement | Bind real card wrapper elements; GSAP animates the wrappers and cleans up tween/ScrollTrigger on unmount |
| RecipeGrid.svelte:39,47 | 2 warnings | Empty SCSS rules | Remove empty rules |
| SandoHubLogo.svelte:177 | 1 warning | Decorative mouse handlers lacked semantics | Named group containing the unchanged brand text |
| TopDownSandwichAssembly.svelte:206,227 | 2 warnings | Empty SCSS rules | Remove empty rules; equivalent color.adjust replaces deprecated darken in the touched component |

A stray literal `svelte` before TopDownSandwichAssembly's script was also removed. Logo and slider honor the initial reduced-motion preference without hiding content or constructing their reveal animations. Screenshot review also reproduced clipping of the last card title at 320px. Slider wrappers now constrain card width to the scroll viewport through a scoped minimum-width token, while other card contexts retain their existing default. The browser regression checks the focused last title lies inside the viewport. Scoped title-link ink/focus also prevents the legacy yellow-on-white focus color, using canonical foreground ink with a neutral fallback. No redesign of the legacy demo page is implied.

## Handwritten JS inventory

At the starting SHA there were already zero `.js` files in `src`, and the services/production recipe path was typed by the first pass. Two diagnostic islands still had untyped Svelte scripts: TestIsland and ColorFontTestIsland. Both now use TypeScript with explicit string data/props. All Svelte script blocks under `src` now opt into TypeScript. Astro's processed `<script>` blocks are TypeScript by default; they must not be treated as untyped JS based on their tag spelling. Native `.mjs` build/configuration/test helpers remain outside the application CMS/recipe runtime. This is an exact inventory, not a claim that every repository file was migrated.

The full `check:svelte` command now includes `--fail-on-warnings`, and CI runs it instead of the narrower slice check. The prior slice command remains available; no check was disabled. Existing strict compiler settings and anonymous CMS behavior remain unchanged. There were no dependency/version or lockfile changes.

## Verification scope

Cloud Node 24, locked install, eight CMS/schema/error/timeout fixtures, full Astro and Svelte checks, CMS TypeScript, read-only ESLint, no-CMS and fixture static builds. The first locked install hit the cloud subprocess/network sandbox (`esbuild` spawn EPERM); granting the supported execution permission and repeating the same offline locked command succeeded. No credentials were copied or provisioned.

`tests/svelte-regression.py` verifies hydrated brand text, home → recipe navigation, all five original slider records, actual DOM reveal visibility, horizontal scrolling to the last card, keyboard focus, reduced motion, and absence of unexpected JS errors at 320/768/1440. Legacy external placeholder images are fulfilled locally for tests; no provider requests or production URL changes are involved. Recipe browse/detail/assembly, JS-disabled rendering, both themes at five widths, actual 200% Chromium zoom and malformed/unavailable CMS states use the existing regression suites. Browser suites accept `AST_BASE_URL` so the resumed cloud run can use an isolated loopback port without disturbing prior servers.

Model ID and reasoning setting: unavailable in this session; no exact identifier or setting was exposed.

Remaining human-only blockers: candidate design approval, original Paper PNG, redacted live-schema/public-permission confirmation and assistive-technology review. No private CMS data or permissions were accessed. No merge, production release, package publication, domain change, credential provisioning or history rewrite is authorized by this follow-up.

## Results at the follow-up code commit

Published code commit: `12673b787c7fd1522bef734f29720d2a9307a88e`; tested/published tree: `7842d033af71a02e2df12a686ac65ced44eb3733`. The evidence-only commit appends this report and screenshots. The original two commits remain ancestors; publication uses fast-forward ref updates.

| Command | Exit/result |
| --- | --- |
| `npm ci --offline --cache /workspace/onboarding/npm-cache --no-audit --no-fund` | 0, unchanged lock/dependencies |
| `npm test` | 0, 8 CMS/schema/error/timeout cases |
| `npm run check:svelte` | 0, full project: 0 errors/0 warnings |
| `npm run typecheck` | 0, full Astro check |
| `npm run typecheck:cms` | 0 |
| `npm run lint` | 0, read-only |
| `PUBLIC_DIRECTUS_URL='' npm run build` | 0 |
| `npm run build:fixture` | 0 |
| `node tests/build-fixture.mjs malformed` + `python tests/states.py malformed` | both 0 |
| `node tests/build-fixture.mjs unavailable` + `python tests/states.py unavailable` | both 0 |
| `python tests/svelte-regression.py` | 0, 3 widths, normal/reduced motion, hydrated links, actual reveal/scroll, keyboard focus and contrast ≥4.5:1 |
| `python tests/browser.py` | 0, 5 widths × 2 themes and written/assembly/error/no-JS regressions |
| `python tests/zoom.py` | 0, actual 200% Chromium zoom |
| `git diff --check` | 0 |

Browser commands used `AST_BASE_URL=http://127.0.0.1:4331`, with the fixture export served by a cloud loopback server. Final inventory: 0 source `.js` files; all 18 Svelte script blocks typed; no explicit `any` or suppression directives found in application source. Existing non-Svelte SCSS build deprecations are separate, unchanged debt.

Focused last-card screenshots (external demo placeholders fulfilled locally, actual unchanged recipe titles): [320](design/screens/followup-slider-320.png), [768](design/screens/followup-slider-768.png), [1440](design/screens/followup-slider-1440.png). These are implementation evidence, not Paper exports or design approval.

## Hosted browser gate

The follow-up browser job in `.github/workflows/quality.yml` uses Ubuntu 24.04, Python 3.12.10 and the complete pinned Python dependency set in `tests/browser-requirements.txt`. Playwright 1.62.0 installs and launches its matching Chromium revision; CI does not depend on `/usr/bin/chromium` or a local desktop. For a cloud executor with an existing browser, `AST_CHROMIUM_EXECUTABLE` is an explicit optional override.

The 15-minute hosted job builds only against the short-lived fixture CMS and executes `tests/run_browser_ci.py`: hydrated logo/slider/normal-and-reduced-motion/keyboard regressions, the retained recipe suite, and empty/malformed/unavailable state builds and browser assertions. The full-project zero-warning Svelte gate remains in the static job. No assertions were removed, and no live CMS/provider permissions or data are involved. The retained actual-browser zoom script remains a separately verified cloud check; it is not part of this hosted job.

The harness constructs a listening loopback server on an ephemeral port before launching suites. There are no readiness polling loops, sleeps or retries. Child suites/builds have 60/120/180-second bounds. A `finally` block shuts down and closes the server, including on failure. Two executable harness self-checks verify that a failed suite preserves its nonzero result and releases its port, and that an assertion failure creates a real screenshot and readable Playwright trace ZIP.

The job always uploads `work/browser-evidence/` for seven days: suite/build output, loopback server logs, successful regression screenshots and assertion-failure screenshots/traces. Failure capture preserves and re-raises the original exception. Browser contexts restrict requests to the loopback origin; legacy placeholder images may be fulfilled locally. Generated evidence and Python bytecode are ignored by Git.

Cloud harness dry run: fixture build, complete browser/state harness, two failure-path self-checks, dependency-pin resolution, read-only lint and whitespace check all exited 0. The cloud dry run used the explicit system-Chromium override; the hosted job installs and tests the pinned Playwright browser without that override. Hosted results are linked from the PR.
