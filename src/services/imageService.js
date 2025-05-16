// AST/src/services/imageService.js
// Utility functions for handling image transformations and optimizations via Directus assets. 

import { getAssetURL } from './directus'; // Assuming getAssetURL is exported from directus.js

/**
 * Generates a URL for a Directus asset with specified transformation parameters.
 * 
 * @param {string | null | undefined} assetId - The ID of the asset from Directus.
 * @param {Object} [options={}] - Transformation options.
 * @param {number} [options.width] - Target width.
 * @param {number} [options.height] - Target height.
 * @param {'cover'|'contain'|'inside'|'outside'} [options.fit='cover'] - How to fit the image.
 * @param {'auto'|'jpg'|'png'|'webp'|'avif'} [options.format='auto'] - Target image format.
 * @param {number} [options.quality=80] - Image quality (1-100).
 * @param {boolean} [options.withoutEnlargement=true] - Avoid upscaling if the requested dimensions are larger than the original.
 * // Add more options as needed based on Directus docs: https://docs.directus.io/guides/files-assets.html#requesting-thumbnails
 * @returns {string | null} The full URL to the transformed asset, or null if no assetId is provided.
 */
export function getTransformedImageURL(assetId, options = {}) {
  const baseAssetURL = getAssetURL(assetId);
  if (!baseAssetURL) return null;

  const params = new URLSearchParams();

  if (options.width) params.append('width', String(options.width));
  if (options.height) params.append('height', String(options.height));
  if (options.fit) params.append('fit', options.fit);
  if (options.format) params.append('format', options.format);
  if (options.quality) params.append('quality', String(options.quality));
  if (options.withoutEnlargement !== undefined) params.append('withoutEnlargement', String(options.withoutEnlargement));
  
  // Example for key (alias for preset - if you have presets configured in Directus)
  // if (options.key) params.append('key', options.key);

  const queryString = params.toString();
  return queryString ? `${baseAssetURL}?${queryString}` : baseAssetURL;
}

// Example usage:
// import { getTransformedImageURL } from './imageService';
// const thumbnailUrl = getTransformedImageURL(imageId, { width: 100, height: 100, format: 'webp' });
// const coverUrl = getTransformedImageURL(imageId, { width: 800, fit: 'cover', quality: 75 }); 