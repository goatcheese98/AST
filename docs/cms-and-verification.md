# Typed public CMS and static verification

Only goatcheese98/AST is changed, from clean default `master` at `9c504c61dba172653813987993df74870d5ecf97`. Restored onboarding source SHA matched; existing helpers were inspected/hash-recorded in the cloud session and left unchanged. No local credentials, live CMS calls, mutations or provider deployments were used.

## Data contract

One `DirectusService` owns anonymous GET requests, safe asset URLs, validation and a five-second abort covering response/body reading. There is no token setting or Authorization header; a query allowlist rejects token parameters as well. Configure public read permission on the CMS separately; this change does not provision it. `PUBLIC_DIRECTUS_URL` must be an HTTP(S) base URL without credentials, query or fragment. Missing configuration causes a safe unavailable page, not an import-time crash. SDK dependency is retained to avoid unrelated dependency removal; duplicate SDK client code is removed.

Recipes require a finite numeric or nonblank string ID and nonblank title. Optional scalar metadata accepts strings/numbers; main_image accepts an ID or `{id}`; categories use the existing `categories_id.name` relation, tags are native string arrays. Ingredients/instructions accept newline text or arrays of strings; existing diagnostic-page object shapes (`name`/`ingredient`, `step`/`instruction`, ingredient `quantity`/`unit`) normalize to escaped plain text. Unknown/malformed shapes reject the collection explicitly. HTML is never injected. Missing written content is stated, not fabricated. The live schema was unavailable and these contracts require confirmation against a redacted real payload before production use. Tests contain explicitly named fixtures; they are never the production fallback.

Recipe URLs use the existing card convention `/recipes/{id}/`; CMS slugs remain data, not a silent URL migration. The browse route now actually uses the validated collection. Recipe detail is a new static route; existing home and demo routes remain. All recipe pages are generated from a CMS snapshot, so changed/new content needs a rebuild. Error details/response bodies are not logged by the boundary.

## Commands

Use Node 24. Cloud commands used writable npm/XDG caches and `ASTRO_TELEMETRY_DISABLED=1`.

```sh
npm ci
npm test
npm run typecheck:cms
npm run typecheck
npm run check:svelte:slice
npm run lint
PUBLIC_DIRECTUS_URL='' npm run build
npm run build:fixture
python -m http.server 4321 --bind 127.0.0.1 --directory dist
# Separate cloud terminal, Python Playwright and cloud Chromium installed:
python tests/browser.py
python tests/zoom.py
```

`build:fixture` owns a short-lived loopback CMS, exports the app, then closes the server. `node tests/build-fixture.mjs empty|malformed|unavailable` exercises the other collection states. No fixture mode is included in application runtime. Browser tests check navigation, written text, previous/next/disabled states, keyboard focus/skip link, JS-disabled content, lazy-import failure/recovery, missing image, themes, reduced motion and widths 320/390/768/1024/1440. The main browser suite includes CSS 200% reflow. `tests/zoom.py` additionally sets real Chromium page zoom to 200% through its internal settings API in a dedicated cloud profile, verifies the layout viewport changes from 1440 to 720, and exercises content/assembly controls. Assistive-technology review remains manual. Screenshots alone are not the functional assertion.

CI adds bounded install, fixture tests, strict boundary, full Astro check, changed-Svelte check, read-only ESLint and no-CMS/fixture static builds. Full-repository Svelte checking is separately available as `npm run check:svelte`; legacy demo diagnostics are not hidden by claiming a full TypeScript migration. ESLint is scoped to the typed service/test boundary; Astro and Svelte use their native checkers.

## Baseline and limits

Reproduced baseline `npm ci` exit 1: TypeScript 5.9.3 missing from lock. Repaired the lock and declared check tooling, retaining existing application versions. Pristine baseline with repaired tooling: Astro check 37 errors; build failed because an Astro carousel was given `client:visible`. Repairs add its missing frontmatter, type the timer/direction, align existing demo recipe types, simplify the diagnostic page to normalized typed text and remove invalid Astro hydration.

Pristine full Svelte check reported 19 errors and 7 warnings in legacy demos (FeaturedSlider, SandoHubLogo and other warnings). The final full check retains 19 errors and 5 warnings in 4 files; the changed components pass with zero errors/warnings. Those unrelated demo implementations are outside this slice; changed components have a dedicated strict gate. Existing home/demo SCSS emits deprecation/empty/comment warnings during builds. No blanket Sass/framework upgrade was attempted.

## Cloudflare preparation

Astro's unchanged default rendering mode is static; successful no-CMS and fixture builds generate `dist/` HTML and assets. A future Cloudflare Pages project can use `npm ci && npm run build` with output `dist`, Node 24 and an anonymous CMS base URL if content is desired. No Worker adapter is needed for this static output. No Cloudflare project, secret, deployment, domain or release was created. Error snapshots need a new build after CMS recovery. Review public CMS permissions, live schema, content and candidate design before any production release.

## Cloud verification results

Locked installation, eight focused tests, strict CMS TypeScript, full Astro check, changed-Svelte check, read-only ESLint, no-CMS export and success/empty/malformed/unavailable fixture exports all exited 0. Each collection state was verified in cloud Chromium. The success journey passed both themes at all five widths, keyboard/focus/skip-link and disabled controls, reduced motion, no-JavaScript written content, missing image and lazy assembly loading/error/reload recovery. The home featured-recipe anchor also worked with JavaScript disabled. Only the intentionally missing fixture image generated a failing request on the success journey; no unexpected JavaScript errors occurred.

Text contrast ratios from the actual canonical colors: light body 17.72:1, muted-on-panel 5.44:1, primary 17.72:1; dark body 16.77:1, muted-on-panel 6.25:1, primary 8.45:1. Focus visibility was asserted in Chromium. Screenshot review covered spacing, wrapping, hierarchy, theme contrast and column stacking.

Implementation screenshots use explicitly marked test ingredients/steps, never production fallback data:

| Width | Light | Dark |
| --- | --- | --- |
| 320 | [PNG](design/screens/recipe-320-light.png) | [PNG](design/screens/recipe-320-dark.png) |
| 768 | [PNG](design/screens/recipe-768-light.png) | [PNG](design/screens/recipe-768-dark.png) |
| 1440 | [PNG](design/screens/recipe-1440-light.png) | [PNG](design/screens/recipe-1440-dark.png) |

Limitations: unapproved Paper candidate; missing original Paper PNG; live schema/content/permissions unverified; 19 existing full-Svelte demo errors; assistive-technology checks outstanding (both real Chromium 200% zoom and CSS 200% reflow passed). No merge, production release or deployment was performed.
