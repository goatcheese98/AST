// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import pagesRecipeRedirects from './src/integrations/pagesRecipeRedirects';

export default defineConfig({
  output: 'static',
  // Preserve the pre-v7 HTML-aware whitespace behavior.
  compressHTML: true,
  site: 'http://localhost:4321',
  integrations: [svelte(), pagesRecipeRedirects()],
});
