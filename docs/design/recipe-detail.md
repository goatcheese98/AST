# Recipe detail: LUM implementation candidate

[Paper candidate](https://app.paper.design/file/01M5B2V6T4YY0M5VW3ECB50E2R/p-1-0), October 19, 2026. Candidate, not approved. Exact supplied JSX, computed styles and tokens are retained in [readback.json](readback.json). The original Paper PNG was not attached and is not committed. Cloud browser screenshots are implementation evidence, not a Paper export.

Read from LUM Brain through the GitHub connector:

- `src/styles/design-tokens.ts`: `e7e0c2362848c209914a5d9da2bcaa5657b663b8`
- `src/styles/fonts.ts`: `d32cace0ed25de3f8e164b9b2d906ca6e782c0e9`
- `src/dashboard-shell-css/primitives.ts`: `86324ebdaca47f0837b09c774e31a96f4d81b2d5`
- `src/dashboard-shell-css/shell-chrome.ts`: `9678f3e1bf6d00e4f2701b355b8612b2a488574b`

`src/styles/lum.css` mirrors the canonical named neutral palettes, including dark gold `--acc:#d6a828` and `--on-acc:#141210`. Fonts are self-hosted Geist and Geist Mono from Fontsource, with system fallbacks; no font provider requests are required. Paper's font aliases, spacing and 24px body leading are destination additions. The 24/32/48px page padding, 360px ingredient column, 64px desktop gap, 30px heading with 36px leading, 32px desktop preparation padding and restrained 8/12px radii follow the exact readback. Mobile body/control text remains 16px rather than shrinking to the candidate's 14px control text. Columns stack below 768px. There is no fixed canvas height.

Sando Hub, recipe IDs, supplied metadata and CMS text replace the invented Assembly brand and example sandwich. No inferred ingredient, allergen, safety, difficulty or serving value is added. Ingredients precede preparation in source order. Recipe headings, lists, links and buttons use semantic native elements. The native Svelte assembly component has a recipe mode driven by written CMS steps; its unrelated demo drawing is never presented as the actual recipe. Recipe mode deliberately uses manual previous/next steps, without autoplay. The existing demo has a pause button, reduced-motion fallback and timeline cleanup.

Static HTML contains every written step without JavaScript. Assembly loads only after a button press; failure keeps the written list and a retry message. Unsupported recipes have no assembly button. Image absence/failure preserves the ingredients. Native focus outlines, a skip link and at least 44px controls support keyboard/touch use. System light/dark preference supplies the theme; a new account/theme preference feature is outside this slice.

The static recipe destination has no browser CMS-fetch/loading phase: build-time data becomes HTML. An `aria-busy` loading state applies to lazy assembly, not a pretend browser recipe request. Collection empty/error states and the 404 browse/back path remain useful without scripting. A static retry reloads the current snapshot; CMS recovery requires a rebuild. The candidate's runtime recipe skeleton is therefore not implemented as a misleading permanent placeholder.

[Actual 200% Chromium zoom](screens/recipe-200-percent-zoom.png) also passed with written/interactive steps visible and no horizontal overflow.
