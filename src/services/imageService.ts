import { getAssetURL } from './directus';
interface Transform {
  width?: number; height?: number; quality?: number; withoutEnlargement?: boolean;
  fit?: 'cover' | 'contain' | 'inside' | 'outside'; format?: 'auto' | 'jpg' | 'png' | 'webp' | 'avif';
}
export function getTransformedImageURL(id?: string | null, options: Transform = {}): string | null {
  const base = getAssetURL(id);
  if (!base) return null;
  const url = new URL(base);
  for (const [key, value] of Object.entries(options)) if (value !== undefined) url.searchParams.set(key, String(value));
  return url.href;
}
