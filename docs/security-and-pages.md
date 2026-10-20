# Dependency and static Pages verification

This follow-up remains on the owned draft branch for goatcheese98/AST. No deployment, Cloudflare account/project, domain, secret, live CMS request, CMS permission change, merge or release is needed or performed.

## Full dependency audit (2026-10-20)

`npm audit --json` includes **production, development, optional and peer dependencies**, not `--omit=dev`. [Before](security/before.json) and [after](security/after.json) record every advisory, affected installed node/version and the shortest dependency chain from **each direct dependency root** reaching that node. They retain unresolved findings; an audit exit of 1 is not a clean security result.

| Audit | Low | Moderate | High | Critical | Affected packages |
| --- | ---: | ---: | ---: | ---: | ---: |
| Baseline a6d53774 | 1 | 2 | 16 | 1 | 20 |
| Compatible repair | 2 | 0 | 1 | 1 | 4 |

`npm audit fix` without `--force` repaired packages within existing semver ranges. Astro stays on major 5 (5.7.13 → 5.18.2); Svelte stays on major 5 (5.30.1 → 5.57.2). Their declared minimum versions now match the repaired versions. The lockfile also repairs the advisory-bearing Vite/Rollup/PostCSS/source-map, Svelte/devalue, Astro/markdown/unstorage/h3/cache/parser and Sass/watcher/glob chains. No unrelated direct package major upgrades or overrides were introduced. Node 24 types are now an explicit development dependency, because Astro no longer supplies them transitively. The empty homepage SCSS block was removed after its comments triggered the updated CSS parser; it contained no declarations.

The newly added **exact-pinned Wrangler 4.151.2 and all its transitive tooling dependencies are included** in the after audit. The four Python browser pins and their PyPI advisory responses are in [python.json](security/python.json): no listed vulnerabilities. The OSV endpoint was denied by the cloud proxy; PyPI's version metadata was used as a separate public advisory source. This is a dated advisory scan, not a claim about unknown vulnerabilities or runner/OS security.

### Remaining findings and reachability

All exact advisory URLs/ranges and chains remain in the after JSON. No findings are suppressed or marked fixed.

| Remaining chain | Why not repaired in this compatible slice | Current reachability |
| --- | --- | --- |
| AST → Astro 5.18.2 (critical aggregate, 10 direct advisories) | npm recommends Astro 7.4.1 through `audit fix --force`, a breaking two-major migration; the Svelte integration also needs coordinated migration | Static exported HTML has no Astro server. Source inspection finds no server islands, Astro View Transitions/directives, `define:vars`, dynamic slot names, HTML attribute spreading, image optimization imports or middleware/auth/base-path logic. CMS content is rendered as escaped text through the existing validated boundary. Reassess before adding any of those features. |
| AST → Astro → Sharp 0.34.5 (high, 3 native image-library advisories) | Astro 5's supported dependency range is below the fixed Sharp releases; forcing a new 0.x minor is not a compatible repair | No `astro:assets` Image/Picture imports or image transforms; images use native `img`. No image server is shipped. Do not process untrusted images through this installed library. |
| AST → Astro → esbuild 0.27.7 (low) | Astro's range excludes the patched esbuild minor; this finding appears in the updated tooling chain | Advisory requires the esbuild development server on **Windows**. Builds/tests here and hosted CI use Linux, and the production artifact contains no development server. |
| AST → @astrojs/svelte 7.0.13 → Astro (low aggregate) | Inherited advisory chain; coordinated framework/integration major migration required | Same static/no-server constraints as above. |

There are no **identified reachable** outstanding findings in the current static route/build usage. Four audit packages nevertheless remain flagged, including a critical aggregate. Do not advertise the dependency tree as vulnerability-free. A future framework migration must preserve native Astro/Svelte behavior and repeat all browser/CMS gates; do not use forced upgrades or ignore flags merely to change the audit count.

## Actual Cloudflare Pages behavior

Astro explicitly uses `output: 'static'`; no server adapter or Worker is added. `wrangler.jsonc` points at `dist`, with a placeholder project name for local verification, not a provisioned project. A successful fixture build exports separate home, recipe index, recipe detail and test/demo HTML routes, a **top-level `404.html`**, and fingerprinted `_astro` assets. The fixture recipe is test-only. `public/_headers` is copied unchanged into `dist/_headers`. There is no `_redirects`, catch-all `/index.html` rewrite, SPA fallback or `_worker.js`.

`python tests/cloudflare_smoke.py` starts pinned Wrangler's real local Pages runtime on a loopback ephemeral port. It waits for the runtime's readiness event (60-second bound), not a sleep/retry, and runs 18 HTTP checks before stopping the process group and checking the port is closed. It strips provider credentials from the child environment, refuses root .env/.dev.vars files, disables telemetry and remote `Request.cf` metadata fetching, and uses no remote bindings. The initial diagnostic run revealed the default metadata lookup; subsequent verification disables it explicitly. No account API or deployment command is invoked.

Verified responses:

- Home, recipe listing and detail return distinct HTML with the expected content; GET and HEAD work.
- `/recipes/fixture-blt` and `/recipes/fixture-blt/index.html` canonically redirect to `/recipes/fixture-blt/` and return the recipe, rather than a homepage fallback.
- Unknown top-level/nested recipe routes and missing `_astro/*.js`, `_astro/*.css` and SVG files return the custom **404** with `Cache-Control: no-store`, for GET and HEAD.
- Existing CSS and favicon return their actual content. Successful responses use `public, max-age=0, must-revalidate`; no wildcard immutable asset policy can cache a missing asset. This conservative policy permits revalidation rather than long-lived caching, including for hashed assets.
- Security headers on successful and missing responses: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, and `Cross-Origin-Opener-Policy: same-origin`.

These headers do not claim a strict CSP. A CSP requires a separate inventory of native Astro hydration scripts, GSAP styles and actual public CMS image origins; no permissive wildcard policy was invented. HSTS and edge/TLS/account cache rules require an actual approved hostname and remote configuration, which were not accessed. Local Pages behavior is evidence for the checked-in artifact/configuration, not proof of a live Cloudflare deployment.

## Reproduce in cloud

Use Node 24 and Python 3.12. `PUBLIC_DIRECTUS_URL=''` keeps the ordinary build offline. The fixture build owns a temporary loopback GET-only server and closes it after exporting; no live provider is used.

```sh
npm ci
npm audit --json                  # exit 1: four documented residual packages
npm test
npm run typecheck:cms
npm run typecheck
npm run check:svelte
npm run lint
PUBLIC_DIRECTUS_URL='' npm run build
npm run build:fixture
python tests/cloudflare_smoke.py
python -m pip install -r tests/browser-requirements.txt
python -m playwright install --with-deps chromium
python -m unittest discover -s tests -p 'test_browser_harness.py'
python tests/run_browser_ci.py
```

The bounded `cloudflare` hosted job runs the fixture export and Pages smoke, and retains runtime logs plus exact HTTP response/header evidence for seven days, including on failure. Existing static zero-warning and hydrated browser/state gates remain intact. Browser screenshots/traces stay in the existing browser artifact. CMS state regression builds replace `dist`, so rebuild successful fixtures before another Pages smoke.

Human-only prerequisites remain: approved Paper reference/original canvas PNG, public CMS schema and anonymous permissions evidence without private access, actual production hostname/account settings, and assistive-technology review. The current `site` URL remains localhost until an approved canonical URL is supplied. A public content update or CMS recovery requires a new static build. None of these prerequisites is fabricated or resolved by local smoke tests.
