// AST/src/services/directus.js
// Core Directus API configuration and client setup will go here.

import { createDirectus, rest } from '@directus/sdk';

// 1. Get the Directus URL from environment variables.
// In Astro, environment variables prefixed with PUBLIC_ are available on the client-side.
// Make sure PUBLIC_DIRECTUS_URL is defined in your .env file (e.g., PUBLIC_DIRECTUS_URL=http://localhost:8055)
const directusUrl = import.meta.env.PUBLIC_DIRECTUS_URL;

if (!directusUrl) {
  const errorMessage = 'Critical Error: PUBLIC_DIRECTUS_URL is not defined. Please set it in your .env file.';
  console.error(errorMessage);
  // In a real app, you might throw an error or have a more robust fallback,
  // especially if this code runs server-side during build.
  // For client-side, this console error will be visible in the browser dev tools.
  // Depending on where/how services are used, this could break parts of your app.
}

// 2. Initialize the Directus client.
// We are using the REST transport here. You could also use GraphQL if preferred.
const directusClient = createDirectus(directusUrl || 'http://fallback-if-url-not-set') // Fallback to prevent crash if URL is missing, though error is logged
  .with(rest());

// 3. Export the initialized client for use in other services (recipeService.js, etc.)
export default directusClient;

// 4. Optional: Re-export commonly used SDK functions if desired for convenience
// export { readItems, readItem, readUsers, readUser, readFiles, readFile } from '@directus/sdk';

// --- Notes on Authentication ---
// The setup above assumes public read access to your Directus collections.
// If authentication is required, you can configure it here.
// For example, using a static access token (ensure it's a read-only token for public data):
//
// import { staticToken } from '@directus/sdk';
// const directusStaticToken = import.meta.env.PUBLIC_DIRECTUS_STATIC_TOKEN;
//
// const directusClientWithAuth = createDirectus(directusUrl)
//   .with(staticToken(directusStaticToken)) // Add static token authentication
//   .with(rest());
// export default directusClientWithAuth; // Then export this client
//
// Remember to add PUBLIC_DIRECTUS_STATIC_TOKEN to your .env file.

// --- Notes on Error Handling & Retries ---
// Basic error handling (e.g., try/catch blocks) should be implemented within the
// individual service functions (e.g., in recipeService.js) when they make API calls.
// The Directus SDK's request method will throw an error on API failures (e.g., 404, 500).
//
// Example in recipeService.js:
// export async function getRecipes() {
//   try {
//     const recipes = await directusClient.request(readItems('recipes'));
//     return recipes;
//   } catch (error) {
//     console.error('API Error fetching recipes:', error.message);
//     return []; // Or throw a custom error, return null, etc.
//   }
// }
//
// Retries are more advanced and not built into the SDK's rest transport by default.
// You might implement a simple retry mechanism in a wrapper function or use a library.

/**
 * Helper function to construct the full URL for a Directus asset.
 * @param {string | null | undefined} assetId - The ID of the asset from Directus.
 * @returns {string | null} The full URL to the asset, or null if no assetId is provided.
 */
export const getAssetURL = (assetId) => {
  if (!assetId || !directusUrl) return null;
  // Ensure no double slashes if directusUrl already ends with one
  const cleanDirectusUrl = directusUrl.replace(/\/$/, '');
  return `${cleanDirectusUrl}/assets/${assetId}`;
}; 