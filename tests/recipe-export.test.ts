import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recipeExports, readRecipeExportIdentity } from '../src/services/recipeExport.ts';
import { recipePath } from '../src/services/directus.ts';

test('export mapping preserves distinct CMS identities and original public URLs with bounded keys', () => {
  const ids = ['a/b', 'a%2Fb', 'a%2fb', 'a%252Fb', '100%', 'café🍞', 'cafe\u0301🍞', '~0061002f0062', '~0', 'a%2Fb'.repeat(20)];
  const exports = recipeExports(ids.map(id => ({ id })));
  assert.equal(new Set(exports.map(row => row.key)).size, ids.length);
  for (const row of exports) {
    assert.deepEqual(readRecipeExportIdentity(row.metadata), { id: row.recipe.id, key: row.key });
    assert.equal(recipePath(row.recipe), `/recipes/${encodeURIComponent(row.recipe.id)}/`);
    assert.ok(Buffer.byteLength(row.key) < 255);
  }
  const direct = recipeExports([{ id: 'fixture-blt' }, { id: 73 }, { id: '*' }, { id: '~*' }, { id: 'café🍞*' }]);
  for (const row of direct) assert.equal(row.key, String(row.recipe.id));
  assert.throws(() => recipeExports([{ id: 'same' }, { id: 'same' }]), /Duplicate normalized recipe IDs/);
});

test('mapping round-trips an exhaustive small alphabet including percent, separators and Unicode', () => {
  const alphabet = ['a', '%', '/', 'é', '~', '🍞'];
  let values = [''];
  const ids: string[] = [];
  for (let length = 1; length <= 3; length++) {
    values = values.flatMap(prefix => alphabet.map(unit => prefix + unit));
    ids.push(...values);
  }
  const exports = recipeExports(ids.map(id => ({ id })));
  assert.equal(new Set(exports.map(row => row.key)).size, ids.length);
  for (const row of exports) {
    assert.equal(readRecipeExportIdentity(row.metadata).id, row.recipe.id);
    assert.equal(readRecipeExportIdentity(row.metadata).key, row.key);
  }
});
