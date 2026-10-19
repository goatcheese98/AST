import DirectusService, { type Query } from './directus';
export const getAllRecipes = (options: { query?: Query } = {}) => new DirectusService().getRecipes(options.query);
