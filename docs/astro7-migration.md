# Native Astro 7 migration

Continues the owned draft at `511bbeffd53b693f014186ae558fc85709130736`. No framework rewrite, live/private CMS request, credentials, permissions, provider account/domain change, deployment, merge or release is involved.

## Supported releases and official guidance

Consulted the current official [v5 → v6 guide](https://docs.astro.build/en/guides/upgrade-to/v6/), [v6 → v7 guide](https://docs.astro.build/en/guides/upgrade-to/v7/) and [Svelte integration guide](https://docs.astro.build/en/guides/integrations-guide/svelte/). Registry publisher metadata for [Astro 7.4.1](https://registry.npmjs.org/astro/7.4.1) and [integration 9.1.0](https://registry.npmjs.org/@astrojs%2fsvelte/9.1.0) confirms:

| Package/runtime | Before | Selected | Compatibility |
| --- | --- | --- | --- |
| Astro | 5.18.2 | **7.4.1**, exact | Node >=22.22.0; npm >=9.6.5 |
| @astrojs/svelte | 7.0.13 | **9.1.0**, exact | Astro ^7; Svelte ^5.43.6; TypeScript ^5.3.3 or ^6 |
| Svelte | 5.57.2 | 5.57.2 | Existing native Svelte 5 components remain supported |
| TypeScript | 5.9.3 | 5.9.3 | Supported integration/check peer |
| @astrojs/check | 0.9.4 | 0.9.11 | Supported TypeScript 5 checker |
| Node | 24 | 24 | Declared in engines/.nvmrc; hosted jobs already select 24 |

Astro/integration packages are upgraded together through normal npm installation, without `audit --force`, overrides or ignored peers. No unrelated direct dependency majors changed. Vite 8 and the supported Svelte Vite plugin come through those packages. The built-in Rust compiler is used; no legacy compiler flag/fallback is enabled.

The v6 review covered string-only static params, normalized route matching, script/style order, and newer dependency APIs. Params were already stringified; normalized matching required the fix below. Existing scripts/styles retain their source order and are checked through rendered/browser comparisons. No removed collections, Astro.glob, ViewTransitions component, adapter internals, custom Zod/Shiki/Markdown APIs, sessions or Container APIs are used.

For v7, `compressHTML: true` explicitly retains HTML-aware whitespace behavior. There are no Markdown plugins, reserved src/fetch.ts, removed DB integration or container-renderer imports to migrate. Native Svelte preprocessing is shared through the documented `vitePreprocess()` in `svelte.config.js`; legacy svelte-preprocess is removed. Existing SCSS and typed scripts remain enabled. Strict compiler options and all existing browser assertions remain intact.

## Demonstrated failures and preserving fixes

1. **Removed private CLI entry.** The first migrated `npm run build:fixture` exited 1 with `Cannot find module .../node_modules/astro/astro.js`. The helper now invokes the existing public `npm run build` command. Its loopback server, anonymous GET-only fixture protocol and cleanup remain unchanged.
2. **Partially decoded route cache keys.** A fixture with the existing URL-helper case `a/b ?` reproduced `NoMatchingStaticPathFound` for `/recipes/a%2Fb %3F/`. Static params now use `decodeURI(encodeURIComponent(String(id)))`: unreserved characters are decoded for native matching, while separators remain encoded. Public `recipePath` behavior and all eight CMS tests are unchanged.
3. **Pages reserved-character asset lookup.** An isolated cloud archive of the prior checkpoint, using the same additional fixtures, built successfully but returned 404 for `/recipes/a%2Fb%20%3F/`. The migrated native export initially did too. Pages decodes the request before filesystem lookup; Astro's artifact contains literal encoded reserved characters. `pagesRecipeRedirects` uses the supported `astro:build:done` hook to generate finite, exact [Pages 200 proxy rules](https://developers.cloudflare.com/pages/configuration/redirects/#proxying) only for affected generated recipe directories. The original URL now returns the intended escaped recipe HTML, without a client redirect or URL-format change.

The rewrite target is the encoded directory URL, not `/index.html`, because Pages rejects directory-to-index rules as potential canonicalization loops. Normal numeric/UUID-like IDs need no rule. No wildcard/splat, remote proxy, homepage fallback, adapter or Worker is added. Unknown pages and missing assets keep real 404/no-store behavior. Existing `_redirects` files are never overwritten. Wildcard-like rules, more than 2,000 static rules or lines over 1,000 characters fail the build rather than silently publishing invalid routing. Actual public CMS ID/schema confirmation remains outstanding; these are fixture-verified cases, not claims about private data.

`tests/rendering-regression.py` builds the additional numeric/encoded-ID and hostile-text fixtures, checks the emitted HTML/links and escaped title/instructions, then runs the original 18 Pages assertions plus two exact recipe URL checks. The existing hosted Pages job executes it and retains its build log and HTTP/runtime evidence. Ordinary builds never use the extra fixture data.

## Security and output comparison

Fresh [baseline full npm audit](security/astro7-before.json): **4 packages** (critical Astro aggregate, high Sharp, low esbuild and Svelte integration chain). After the supported migration: **0 at every severity**, including runtime, development, optional and peer dependencies and pinned Wrangler tooling. [Full after report](security/astro7.json) retains the scan metadata. Astro now resolves patched Sharp 0.35.5; its old esbuild dependency chain is removed. No advisory exceptions, suppressions or audit filters are used. Hosted CI now runs `npm audit --audit-level=low` on the complete installed tree.

The four unchanged Python browser pins were freshly checked against PyPI's version advisory metadata: [no listed advisories](security/python.json). OS/runner packages and unknown vulnerabilities are outside this dependency report.

The saved pre-migration successful fixture export and migrated export both contain **the same eight HTML route files**. Their visible text and anchor URLs match on every route after normalizing only the ephemeral loopback fixture port in the existing raw-data debug page: [comparison report](security/rendered-comparison.json). The raw comparison showed exactly that one port difference; no application text/link difference was discarded. Fingerprinted bundle names/compiler output are expected to change. All **nine** freshly generated cloud screenshots match the saved pre-migration screenshots **pixel for pixel**: six recipe screenshots (320/768/1440, light/dark) and three focused slider screenshots. The comparison verified fresh timestamps, equal dimensions and zero changed pixels per image: [full report](security/screenshot-comparison.json). Hosted screenshots/logs are linked from the draft PR.

## Gates and remaining needs

`npm ci`; full `npm audit`; all eight CMS tests; CMS/Astro/full Svelte diagnostics; lint including the new integration; offline/no-CMS and normal fixture builds; browser failure/evidence/cleanup self-checks; full hydrated Svelte/recipe/CMS-state suites; original 18 real Pages checks; and additional encoded-ID/escaped-rendering checks are required. Astro now fails on warnings explicitly (`--minimumFailingSeverity warning`); full Svelte still uses `--fail-on-warnings`. Existing informational hints, legacy Sass deprecations and the unrelated ESLint 9 support notice are not suppressed. Direct hook checks also passed for ordinary/no-rule output, exact reserved-ID routing, wildcard rejection, existing-config preservation and line-limit rejection.

Run standard fixtures before Pages/browser suites: state/rendering builds replace `dist`. To run the additional regression in cloud, use `python tests/rendering-regression.py`; it owns its fixture build and Pages process. Normal workflow gates use no live CMS.

Unchanged human needs: approved Paper canvas/original PNG, public anonymous CMS schema/permission evidence, real approved canonical hostname/remote edge settings and assistive-technology review. Local Pages smoke proves the checked-in output and configuration, not a remote deployment. Content recovery/updates still require static rebuilds. Model ID and reasoning setting are unavailable in this session.
