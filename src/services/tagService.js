// AST/src/services/tagService.js
// Functions for fetching tags, categories, and other taxonomy data from Directus. 

import directusClient from './directus';
import { readItems } from '@directus/sdk';

const TAGS_COLLECTION = 'tags';
const CATEGORIES_COLLECTION = 'categories';

/**
 * Fetches all tags from Directus.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of tag items.
 */
export async function getAllTags(options = {}) {
  try {
    const defaultParams = {
      fields: ['id', 'name', 'slug'], // Assuming 'slug' might exist on tags too, if not, remove
      sort: ['name'] // Sort alphabetically by name
    };
    const params = { ...defaultParams, ...options.query };

    const tags = await directusClient.request(
      readItems(TAGS_COLLECTION, params)
    );
    return tags;
  } catch (error) {
    console.error(`API Error fetching all tags: ${error.message}`);
    throw error;
  }
}

/**
 * Fetches all categories from Directus.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of category items.
 */
export async function getAllCategories(options = {}) {
  try {
    const defaultParams = {
      fields: ['id', 'name', 'slug'], // Assuming 'slug' might exist, if not, remove
      sort: ['name'] // Sort alphabetically by name
    };
    const params = { ...defaultParams, ...options.query };

    const categories = await directusClient.request(
      readItems(CATEGORIES_COLLECTION, params)
    );
    return categories;
  } catch (error) {
    console.error(`API Error fetching all categories: ${error.message}`);
    throw error;
  }
}

// You could also add functions like:
// - getTagBySlug(slug)
// - getCategoryBySlug(slug) 