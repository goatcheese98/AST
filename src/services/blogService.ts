import DirectusService, { record, text, assetId, relationNames, CmsError, type Query } from './directus';
const client = () => new DirectusService();
function parsePost(value: unknown) {
  const post = record(value), id = text(post.id), title = text(post.title);
  if (!id || !title) throw new CmsError('malformed');
  const author = post.author == null ? null : record(post.author);
  return { id, title, slug: text(post.slug), published_date: text(post.published_date), content: text(post.content),
    featuredImageUrl: client().getAssetUrl(assetId(post.featured_image)), authorName: author ? text(author.name) : null,
    authorAvatarUrl: author ? client().getAssetUrl(assetId(author.avatar)) : null, tags: relationNames(post.tags, 'tags_id') };
}
const fields = '*,featured_image.id,author.name,author.avatar.id,tags.tags_id.name';
export const getAllBlogPosts = (options: { query?: Query } = {}) =>
  client().items('blog_posts', parsePost, { fields, sort: '-published_date', ...options.query });
export async function getBlogPostBySlug(slug: string) {
  if (!slug) return null;
  return (await client().items('blog_posts', parsePost, { fields, filter: { slug: { _eq: slug } }, limit: 1 }))[0] ?? null;
}
