import { Buffer } from 'node:buffer';

export interface RecipeExportIdentity { id: string; key: string; }

function directFilename(value: string): boolean {
  return value.length > 0 && !['.', '..'].includes(value) &&
    !/[%\\/?:@&=+$,;#\u0000-\u001f\u007f]/.test(value) &&
    value.normalize() === value && !/^~[0-9a-z]+$/.test(value);
}

function encodeIdentity(identity: RecipeExportIdentity): string {
  return Buffer.from(JSON.stringify(identity), 'utf8').toString('base64url');
}

/** A per-build bijection. Short opaque keys never impose an ID-sized filename. */
export function recipeExports<T extends { id: string | number }>(recipes: readonly T[]):
  Array<{ recipe: T; key: string; metadata: string }> {
  const ids = recipes.map(recipe => String(recipe.id));
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate normalized recipe IDs cannot share a static export');
  // Code-unit ordering keeps distinct Unicode forms distinct; input order is untouched.
  const keys = new Map([...ids].sort().map((id, index) => [id, directFilename(id) ? id : `~${index.toString(36)}`]));
  return recipes.map(recipe => {
    const id = String(recipe.id);
    const key = keys.get(id);
    if (key === undefined) throw new Error('Missing recipe export key');
    return { recipe, key, metadata: encodeIdentity({ id, key }) };
  });
}

/** Decode only our explicit emitted metadata, never filesystem percent sequences. */
export function readRecipeExportIdentity(metadata: string): RecipeExportIdentity {
  const value: unknown = JSON.parse(Buffer.from(metadata, 'base64url').toString('utf8'));
  if (!value || typeof value !== 'object' || !('id' in value) || !('key' in value) ||
      typeof value.id !== 'string' || typeof value.key !== 'string') throw new Error('Invalid recipe export identity');
  const identity = { id: value.id, key: value.key };
  if (encodeIdentity(identity) !== metadata) throw new Error('Non-canonical recipe export identity');
  return identity;
}
