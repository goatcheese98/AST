import DirectusService, { record, text, CmsError, type Query } from './directus';
function taxonomy(value: unknown) {
  const row = record(value);
  const id = text(row.id), name = text(row.name);
  if (!id || !name) throw new CmsError('malformed');
  return { id, name, slug: text(row.slug) };
}
export const getAllTags = (options: { query?: Query } = {}) =>
  new DirectusService().items('tags', taxonomy, { fields: 'id,name,slug', sort: 'name', ...options.query });
export const getAllCategories = (options: { query?: Query } = {}) =>
  new DirectusService().items('categories', taxonomy, { fields: 'id,name,slug', sort: 'name', ...options.query });
