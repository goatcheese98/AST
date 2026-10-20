# Preserve recipe URL identity through static export

The `8da5e71a46366b1b6fa21e826fd1d67268c894ad` checkpoint introduced a collision: `decodeURI(encodeURIComponent(id))` gives the same static param for `a/b` and `a%2Fb`, although their original public links are `/recipes/a%2Fb/` and `/recipes/a%252Fb/`. Expanded offline fixtures reproduced Astro's skipped conflicting route, `Invalid URL encoding` for `100%`, and `URI malformed` in the directory-based rewrite decoder. Those failures were real; the earlier two rendering fixtures did not cover them.

## Preserving correction

`recipeExports` assigns a **short build-only artifact key**, alongside explicit original-ID/key metadata on the emitted recipe header. Directly servable NFC filenames keep their original key unless they resemble the reserved opaque-key namespace. Other IDs receive a unique `~`/base-36 rank from the complete sorted ID set. This is an internal per-build bijection, not a hash, slug, renamed CMS ID or new public URL. Changing the set can change internal keys; every public link remains the original `recipePath` and the complete build regenerates its exact routing rules together.

Plain keys exclude the opaque namespace; opaque ranks are unique within the build. Astro normalization cannot collapse those ASCII keys, and the original ID is retained in explicit canonical metadata rather than inferred from the key. Numeric IDs keep existing String(id) semantics. Duplicate normalized IDs fail explicitly instead of sharing a route. The accepted CMS validation is unchanged: the representation selector never trims or normalizes an ID. A 100-character accepted percent-containing ID is also tested, so an ID-sized encoded filename cannot introduce a smaller filesystem limit.

The Pages hook reads only the marker on a real trusted recipe header, validates its canonical metadata, and verifies that the key owns its export directory. It calls the existing `recipePath` function on that original ID. It never decodes filesystem percent sequences. Metadata is base64url-encoded JSON, which preserves literal percent signs, Unicode forms and quotes without introducing executable markup. Exact 200 rules point to the key's own directory; directly servable paths need no rule. Existing Pages rule limits, wildcard protection and existing-config preservation remain enforced; there is no SPA/catch-all fallback or new adapter.

The lookalike fixture also checks a subtle routing case: one recipe's internal target can equal another recipe's original public path. Pages applies only the first exact proxy rule, so both public requests must still return their own distinct artifact. The actual local Pages regression verifies this behavior rather than assuming recursive rewrite semantics.

## Regression contract

All original assertions remain, including numeric-ID and hostile-text rendering, the standard 18 Pages checks and their 20-check rendering extension. The expanded rendering run adds GET and HEAD requests for each of twelve fixture identities, totaling **44 Pages HTTP assertions**:

- Existing numeric `73` and reserved `a/b ?` (escaped script/image-like text).
- `a/b`, literal `a%2Fb`, and case-distinct literal `a%2fb`.
- Literal percent IDs `100%` and `%`.
- NFC `café🍞` and distinct decomposed `café🍞`.
- Literal export-key lookalikes `~0061002f0062` and `~0`.
- A 100-character literal-percent ID, preserving its full original public URL.

The test locates exactly one emitted HTML artifact for each fixture's unique title, checks its own preparation text, and verifies the listing retains the original public link. Every real Pages GET response must equal that recipe's complete artifact bytes; HEAD must return the same status/security/cache headers with no body. Distinct identities cannot share an export. `recipe-identities.json`, response headers and runtime/build logs are retained by hosted CI. The HTML parser's existing escaping assertions were moved intact to a shared test helper.

Two new TypeScript tests cover the explicit collision/Unicode/lookalike cases and metadata round-trip/key uniqueness across 258 strings from an exhaustive small alphabet. All eight original CMS tests are retained, for ten Node tests in total. Ordinary fixture builds still have the same eight route files and public text/links; the expanded dataset is test-only. Full Astro/Svelte checks, lint, offline/fixture builds, browser failure/evidence self-checks, all browser/state suites and the original nine-image comparison remain required. No checks or accepted IDs were suppressed to make the tests pass.

Cloud verification of this correction passed: clean install; ten Node tests; CMS/Astro/full-Svelte strict checks; lint; offline and fixture builds; 18 standard plus 44 expanded real Pages assertions; and two browser-harness failure/cleanup self-tests. The full browser/state suites passed, and all nine fresh screenshots have zero changed pixels against `8da5e71`. The eight-route visible-text/public-link comparison also has no differences. See [rendered comparison](security/rendered-comparison.json) and [screenshot comparison](security/screenshot-comparison.json). Full npm runtime/tooling audit remains zero; the four pinned Python packages have no listed PyPI advisories. Hosted CI re-runs the gates on the published commit and retains its screenshots and Pages identity manifest.

Reproduce in cloud:

```sh
npm ci
npm test
npm run typecheck:cms
npm run typecheck
npm run check:svelte
npm run lint
PUBLIC_DIRECTUS_URL='' npm run build
npm run build:fixture
python tests/cloudflare_smoke.py
python tests/rendering-regression.py
# Rendering/state builds replace dist; restore normal fixtures before browser suites.
npm run build:fixture
python -m unittest discover -s tests -p test_browser_harness.py
python tests/run_browser_ci.py
```

Framework versions and the zero-advisory dependency repair remain unchanged. No live/private CMS, permission/account/credential/domain change, deployment or merge is involved. Paper approval/original canvas, public CMS schema/permissions evidence, canonical hostname/edge settings and assistive-technology review remain unverified human inputs.
