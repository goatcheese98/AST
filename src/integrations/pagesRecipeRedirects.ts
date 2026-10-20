import type { AstroIntegration } from 'astro';
import { access, readdir, writeFile } from 'node:fs/promises';

/** Preserve recipe URLs when Pages decodes reserved characters before asset lookup. */
export default function pagesRecipeRedirects(): AstroIntegration {
  return {
    name: 'pages-recipe-redirects',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const entries = await readdir(new URL('recipes/', dir), { withFileTypes: true });
        const rules: string[] = [];
        for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
          if (!entry.isDirectory() || !entry.name.includes('%')) continue;
          const source = `/recipes/${encodeURIComponent(decodeURIComponent(entry.name))}/`;
          const target = `/recipes/${encodeURIComponent(entry.name)}/`;
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
