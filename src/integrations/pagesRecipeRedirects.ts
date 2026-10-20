import type { AstroIntegration } from 'astro';
import { access, readFile, readdir, writeFile } from 'node:fs/promises';
import { recipePath } from '../services/directus';
import { readRecipeExportIdentity } from '../services/recipeExport';

/** Map original public URLs to injective build-only artifact keys. */
export default function pagesRecipeRedirects(): AstroIntegration {
  return {
    name: 'pages-recipe-redirects',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const entries = await readdir(new URL('recipes/', dir), { withFileTypes: true });
        const rules: string[] = [];
        for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
          if (!entry.isDirectory()) continue;
          let html: string;
          try { html = await readFile(new URL(`recipes/${encodeURIComponent(entry.name)}/index.html`, dir), 'utf8'); } catch (error) {
            if (error instanceof Error && 'code' in error && error.code === 'ENOENT') continue;
            throw error;
          }
          // The marker is on a real trusted header tag; escaped CMS text cannot supply it.
          const metadata = html.match(/<header\b[^>]*\bdata-recipe-export="([A-Za-z0-9_-]+)"/)?.[1];
          if (!metadata) continue;
          const { id, key } = readRecipeExportIdentity(metadata);
          if (key !== entry.name) throw new Error('Recipe metadata does not own its export directory');
          const source = recipePath({ id });
          const target = `/recipes/${encodeURIComponent(key)}/`;
          if (source === target) continue;
          if (source.includes('*') || target.includes('*')) {
            throw new Error('A recipe URL cannot be represented as an exact Pages rule');
          }
          if (source !== target) rules.push(`${source} ${target} 200`);
        }
        if (!rules.length) return;
        if (rules.length > 2000 || rules.some(rule => rule.length > 1000)) {
          throw new Error('Recipe rewrites exceed the documented Pages static-rule limits');
        }
        const output = new URL('_redirects', dir);
        let exists = false;
        try { await access(output); exists = true; } catch (error) {
          if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error;
        }
        if (exists) throw new Error('Recipe rewrite generation must not overwrite an existing _redirects file');
        // Finite exact paths only; never rewrite unknown routes or assets to a homepage.
        await writeFile(output, `${rules.join('\n')}\n`, { flag: 'wx' });
      },
    },
  };
}
