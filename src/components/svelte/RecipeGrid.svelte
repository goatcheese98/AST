<script context="module" lang="ts">
  // Interface for the recipe item, matching RecipeCard.svelte's RecipeData prop
  export interface RecipeListItem {
    id: string; // Assuming id will be a string for routing, e.g., slug or Directus ID
    title: string;
    imageUrl: string; // Renamed from 'image' to match RecipeCard.svelte
    description: string; // Renamed from 'short_description'
    tags: string[];
    prepTime: string;
    cookTime: string;
    servings: number; // Added to match RecipeCard.svelte
    // Other fields like 'slug' or 'difficulty' can be added if needed for filtering/display
  }
</script>

<script lang="ts">
  import RecipeCard from './RecipeCard.svelte'; // Assuming this path and existing card
  // RecipeListItem is imported from module context

  export let recipes: RecipeListItem[] = [];
</script>

<div class="recipe-grid-container">
  {#if recipes.length === 0}
    <p>No recipes found.</p>
  {:else}
    <div class="grid">
      {#each recipes as recipeItem (recipeItem.id)}
        <div class="grid-item">
          <RecipeCard recipe={recipeItem} /> 
          <!-- Changed prop name to "recipe" assuming that's what RecipeCard.svelte expects -->
        </div>
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .recipe-grid-container {
    // Styles for the container if any
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }
  .grid-item {
    // Styles for individual item wrapper if needed
  }
</style> 