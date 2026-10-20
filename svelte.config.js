// @ts-check
import { vitePreprocess } from '@astrojs/svelte';

// Share the supported Vite SCSS/TypeScript preprocessing with build and diagnostics.
export default { preprocess: vitePreprocess() };
