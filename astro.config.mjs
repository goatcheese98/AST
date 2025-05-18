// @ts-check
import { defineConfig } from 'astro/config';
import svelte from "@astrojs/svelte";
import sveltePreprocess from "svelte-preprocess";

// https://astro.build/config
export default defineConfig({
  site: 'http://localhost:4321',
  integrations: [
    svelte({
      preprocess: sveltePreprocess({
        scss: {
          // You can add options here if needed, e.g., includePaths
        },
      }),
    }),
  ]
});
