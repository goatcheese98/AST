/** Public, read-only CMS boundary. Never accepts or sends an access token. */
export class CmsError extends Error {
  readonly code: 'configuration' | 'unavailable' | 'malformed';
  constructor(code: 'configuration' | 'unavailable' | 'malformed') {
    super(`CMS ${code}`);
    this.code = code;
  }
}
export interface Query {
  fields?: string | string[]; sort?: string | string[]; filter?: Record<string, unknown>;
  limit?: number; page?: number; offset?: number;
}
export interface Recipe {
  id: string | number; title: string; slug?: string;
  short_description?: string; prep_time?: string; cook_time?: string;
  difficulty?: string; servings?: string; status?: string; date_published?: string;
  main_image: { id: string } | null; imageUrl: string | null;
  categories: string[]; tags: string[]; ingredients: string[]; instructions: string[];
}
export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new CmsError('malformed');
  return value as Record<string, unknown>;
}
export function text(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  throw new CmsError('malformed');
}
function strings(value: unknown): string[] {
  if (value == null) return [];
  if (!Array.isArray(value) || !value.every(v => typeof v === 'string')) throw new CmsError('malformed');
  return value;
}
function lines(value: unknown, keys: string[]): string[] {
  if (value == null || value === '') return [];
  if (typeof value === 'string') return value.split(/\r?\n/).filter(s => s.trim());
  if (!Array.isArray(value)) throw new CmsError('malformed');
  return value.map(item => {
    if (typeof item === 'string' && item.trim()) return item;
    const obj = record(item);
    const line = keys.map(key => obj[key]).find(v => typeof v === 'string' && v.trim());
    if (typeof line !== 'string') throw new CmsError('malformed');
    // Keep quantities and units exactly as supplied; never invent servings/allergens.
    return [text(obj.quantity), text(obj.unit), line].filter(Boolean).join(' ');
  });
}
export function assetId(value: unknown): string | undefined {
  if (value == null) return undefined;
  const id = text(typeof value === 'object' ? record(value).id : value);
  if (!id || id === '.' || id === '..') throw new CmsError('malformed');
  return id;
}
export function relationNames(value: unknown, key: string): string[] {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new CmsError('malformed');
  return value.flatMap(item => {
    const related = record(item)[key];
    if (related == null) return [];
    const name = text(record(related).name);
    return name ? [name] : [];
  });
}
export function parseRecipe(value: unknown, asset: (id?: string) => string | null): Recipe {
  const r = record(value);
  if ((typeof r.id !== 'string' && typeof r.id !== 'number') || !String(r.id).trim() || ['.', '..'].includes(String(r.id)) ||
      (typeof r.id === 'number' && !Number.isFinite(r.id)) || typeof r.title !== 'string' || !r.title.trim()) {
    throw new CmsError('malformed');
  }
  const image = assetId(r.main_image);
  return {
    id: r.id, title: r.title, slug: text(r.slug), short_description: text(r.short_description),
    prep_time: text(r.prep_time), cook_time: text(r.cook_time), difficulty: text(r.difficulty),
    servings: text(r.servings), status: text(r.status), date_published: text(r.date_published),
    main_image: image ? { id: image } : null, imageUrl: asset(image),
    categories: relationNames(r.categories, 'categories_id'), tags: strings(r.tags),
    ingredients: lines(r.ingredients, ['name', 'ingredient']),
    instructions: lines(r.instructions, ['step', 'instruction']),
  };
}
export function recipePath(recipe: Pick<Recipe, 'id'>): string {
  return `/recipes/${encodeURIComponent(String(recipe.id))}/`;
}
export default class DirectusService {
  private readonly base: URL | null;
  private readonly transport: typeof fetch;
  private readonly timeoutMs: number;
  constructor(url: string | undefined = import.meta.env?.PUBLIC_DIRECTUS_URL,
    transport: typeof fetch = fetch, timeoutMs = 5000) {
    this.transport = transport;
    this.timeoutMs = timeoutMs;
    try {
      this.base = url ? new URL(url.endsWith('/') ? url : `${url}/`) : null;
      if (this.base && (!['https:', 'http:'].includes(this.base.protocol) || this.base.username ||
        this.base.password || this.base.search || this.base.hash)) throw new Error();
    } catch { throw new CmsError('configuration'); }
  }
  async items<T>(collection: 'recipes' | 'blog_posts' | 'categories' | 'tags',
    parse: (value: unknown) => T, query: Query = {}): Promise<T[]> {
    if (!this.base) throw new CmsError('configuration');
    const url = new URL(`items/${collection}`, this.base);
    for (const [key, value] of Object.entries(query)) {
      if (!['fields', 'sort', 'filter', 'limit', 'page', 'offset'].includes(key)) throw new CmsError('configuration');
      if (value !== undefined) url.searchParams.set(key, Array.isArray(value) ? value.join(',') : typeof value === 'string' ? value : JSON.stringify(value));
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.transport(url, { signal: controller.signal, credentials: 'omit', redirect: 'error' });
      if (!response.ok) throw new CmsError('unavailable');
      const payload = record(await response.json());
      if (!Array.isArray(payload.data)) throw new CmsError('malformed');
      return payload.data.map(parse);
    } catch (error) {
      // Do not log upstream URLs, bodies, headers or possibly sensitive CMS errors.
      throw error instanceof CmsError ? error : new CmsError('unavailable');
    } finally { clearTimeout(timer); }
  }
  getAssetUrl(id?: string): string | null {
    return id && id !== '.' && id !== '..' && this.base ? new URL(`assets/${encodeURIComponent(id)}`, this.base).href : null;
  }
  getRecipes(query: Query = {}): Promise<Recipe[]> {
    return this.items('recipes', value => parseRecipe(value, id => this.getAssetUrl(id)), {
      fields: '*,main_image.id,categories.categories_id.name', sort: '-date_published', limit: -1, ...query,
    });
  }
}
export const getAssetURL = (id?: string | null): string | null => new DirectusService().getAssetUrl(id ?? undefined);
