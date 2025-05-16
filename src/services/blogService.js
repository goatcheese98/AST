// AST/src/services/blogService.js
// Functions for fetching and managing blog post data from Directus. 

import directusClient, { getAssetURL } from './directus';
import { readItems } from '@directus/sdk';

const BLOG_POSTS_COLLECTION = 'blog_posts'; // Adjust if your collection name is different

/**
 * Fetches all blog posts from Directus.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of blog post items.
 */
export async function getAllBlogPosts(options = {}) {
  try {
    const defaultParams = {
      fields: [
        '*',
        'featured_image.id',
        'author.name',
        'author.avatar.id',
        'tags.tags_id.name'
      ],
      sort: ['-published_date'],
      // filter: { status: { _eq: 'published' } }
    };
    const params = { ...defaultParams, ...options.query };

    const result = await directusClient.request(
      readItems(BLOG_POSTS_COLLECTION, params)
    );

    return result.map(post => ({
      ...post,
      featuredImageUrl: post.featured_image ? getAssetURL(post.featured_image.id || post.featured_image) : null,
      authorName: post.author ? post.author.name : null,
      authorAvatarUrl: post.author && post.author.avatar ? getAssetURL(post.author.avatar.id || post.author.avatar) : null,
      tags: post.tags ? post.tags.map(tagRel => tagRel.tags_id?.name).filter(name => name) : []
    }));

  } catch (error) {
    console.error(`API Error fetching all blog posts: ${error.message}`);
    throw error;
  }
}

/**
 * Fetches a single blog post by its slug from Directus.
 * @param {string} slug - The slug of the blog post.
 * @returns {Promise<Object|null>} A promise that resolves to the blog post item or null if not found.
 */
export async function getBlogPostBySlug(slug) {
  if (!slug) {
    console.error('getBlogPostBySlug: slug is required');
    return null;
  }
  try {
    const result = await directusClient.request(
      readItems(BLOG_POSTS_COLLECTION, {
        filter: { slug: { _eq: slug } },
        fields: [
          '*',
          'featured_image.id',
          'author.name',
          'author.avatar.id',
          'tags.tags_id.name'
        ],
        limit: 1
      })
    );

    if (result && result.length > 0) {
      const post = result[0];
      return {
        ...post,
        featuredImageUrl: post.featured_image ? getAssetURL(post.featured_image.id || post.featured_image) : null,
        authorName: post.author ? post.author.name : null,
        authorAvatarUrl: post.author && post.author.avatar ? getAssetURL(post.author.avatar.id || post.author.avatar) : null,
        tags: post.tags ? post.tags.map(tagRel => tagRel.tags_id?.name).filter(name => name) : []
      };
    }
    return null;
  } catch (error) {
    console.error(`API Error fetching blog post by slug "${slug}": ${error.message}`);
    throw error;
  }
} 