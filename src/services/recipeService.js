// AST/src/services/recipeService.js
// Functions for fetching and managing recipe data from Directus. 

import directusClient, { getAssetURL } from './directus';
import { readItems } from '@directus/sdk';

const RECIPES_COLLECTION = 'recipes'; // Adjust if your collection name is different

/**
 * Fetches all recipes from Directus.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of recipe items.
 */
export async function getAllRecipes(options = {}) {
  try {
    const defaultParams = {
      fields: [
        '*',
        'main_image.id',
        'categories.categories_id.name', // Assuming junction field 'categories', related field 'categories_id', and 'name' in 'categories' collection
        // 'tags.tags_id.name' // Removed: Tags are now a direct array of strings
      ],
      sort: ['-date_published'], // Sort by newest published date
      // filter: { status: { _eq: 'published' } } // Example if you have a status field to filter by
    };
    const params = { ...defaultParams, ...options.query };

    const result = await directusClient.request(
      readItems(RECIPES_COLLECTION, params)
    );

    return result.map(recipe => {
      // console.log('Inspecting recipe.main_image for recipe:', recipe.title, recipe.main_image); // Remove Temporary log
      return {
        ...recipe,
        imageUrl: recipe.main_image ? getAssetURL(recipe.main_image.id || recipe.main_image) : null,
        categories: recipe.categories ? recipe.categories.map(catRel => catRel.categories_id?.name).filter(name => name) : [],
        // tags: recipe.tags ? recipe.tags.map(tagRel => tagRel.tags_id?.name).filter(name => name) : [] // Removed: Tags are now a direct array of strings, no mapping needed if fetched with '*'
        // tags will be available as recipe.tags directly if the field key is 'tags'
      };
    });

  } catch (error) {
    console.error(`API Error fetching all recipes: ${error.message}`);
    // error.response?.data?.errors might contain more specific Directus errors
    // console.error('Directus errors:', error.response?.data?.errors);
    throw error; // Re-throw the error to fail the build if data fetching fails
  }
}
