<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  let searchTerm = '';
  const dispatch = createEventDispatcher();

  function handleInput() {
    // Add debouncing here in a real implementation
    dispatch('search', searchTerm);
  }
</script>

<div class="recipe-search-container">
  <input type="search" bind:value={searchTerm} on:input={handleInput} placeholder="Search recipes..." />
</div>

<style lang="scss">
  @use '../../styles/base/variables' as v; // Import variables

  .recipe-search-container {
    margin-bottom: var(--space-lg, 1.5rem); // Use variable for consistency

    input[type="search"] {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid var(--color-border, #ccc); // Use variable
      border-radius: var(--border-radius-md, 8px); // Use variable
      font-size: 1rem;
      line-height: 1.5;
      background-color: var(--color-background-input, #fff);
      color: var(--color-text-input, #333);
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.05); // Subtle inner shadow
      transition: border-color 0.2s ease, box-shadow 0.2s ease;

      &:focus {
        outline: none;
        border-color: var(--color-primary, #FFA500); // Use variable
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.05), 0 0 0 3px rgba(var(--color-primary-rgb, 255, 165, 0), 0.25); // Focus ring, assumes --color-primary-rgb is defined
      }

      &::placeholder {
        color: var(--color-text-placeholder, #999);
        opacity: 1; // Ensure placeholder is visible
      }
    }
  }
</style> 