<script context="module" lang="ts">
  // AST/src/components/svelte/ExpandingRecipeCard.svelte
  // Interface for the recipe prop, moved to module context
  export interface RecipeItem {
    id: number | string; 
    title: string;
    image: string;
    description: string;
    tags: string[];
    prepTime: string;
    cookTime: string;
    difficulty?: string;
    servings?: number;
  }
</script>

<script lang="ts">
  // AST/src/components/svelte/ExpandingRecipeCard.svelte
  import { recipePath } from '../../services/directus';
  import { onMount, onDestroy } from 'svelte'; // Added onDestroy
  // Type is imported from module script implicitly by Svelte if defined above
  // For clarity, one might use `import type { RecipeItem } from './ExpandingRecipeCard.svelte';`
  // but Svelte often handles this fine if defined in module context of the same file.

  // Prop for the recipe data
  export let recipe: RecipeItem;

  // Reactive variable to normalize difficulty string for comparison
  $: normalizedDifficulty = recipe.difficulty?.toLowerCase() || 'n/a';

  let cardRef: HTMLDivElement;
  let tagsViewportRef: HTMLDivElement;
  let tagsTrackRef: HTMLDivElement;
  let hoverTimeout: ReturnType<typeof setTimeout> | null = null;
  let scrollAnimationId: number | null = null;
  const scrollSpeed = 0.2; // pixels per frame, adjusted for slower speed

  function startTagScroll() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!tagsViewportRef || !tagsTrackRef || !recipe.tags || recipe.tags.length === 0) return;

    const viewportWidth = tagsViewportRef.clientWidth;
    const totalTrackWidth = tagsTrackRef.scrollWidth; // Width of all 4 sets of tags.
    const numberOfRepetitions = 4; // We are rendering 4 sets of tags.
    const singleSetWidth = totalTrackWidth / numberOfRepetitions; // Width of one original set of tags.

    if (singleSetWidth <= viewportWidth) {
      // console.log('Single set of tags does not overflow, no scroll needed.');
      // If not scrolling, ensure the track is reset, though stopTagScroll should handle this.
      if (tagsTrackRef) {
        tagsTrackRef.style.transform = 'translateX(0px)';
      }
      return; // No need to scroll
    }

    // console.log('Starting infinite tag scroll animation');
    let currentScroll = 0;
    const maxScrollLoopPoint = singleSetWidth; // Point at which to loop.

    // Ensure animation is stopped and scroll is reset before starting a new one
    if (scrollAnimationId) {
      cancelAnimationFrame(scrollAnimationId);
      scrollAnimationId = null;
    }
    if (tagsTrackRef) {
      tagsTrackRef.style.transform = 'translateX(0px)';
    }
    currentScroll = 0; // Reset scroll position for the new animation

    function animateScroll() {
      if (!tagsTrackRef) return; // Guard against element disappearing
      currentScroll += scrollSpeed;

      if (currentScroll >= maxScrollLoopPoint) {
        currentScroll -= maxScrollLoopPoint; // Wrap around for infinite loop
        // Applying transform immediately after reset can make loop smoother
        tagsTrackRef.style.transform = `translateX(-${currentScroll}px)`;
      }
      
      tagsTrackRef.style.transform = `translateX(-${currentScroll}px)`;
      scrollAnimationId = requestAnimationFrame(animateScroll);
    }
    scrollAnimationId = requestAnimationFrame(animateScroll);
  }

  function stopTagScroll() {
    if (scrollAnimationId) {
      cancelAnimationFrame(scrollAnimationId);
      scrollAnimationId = null;
    }
    if (tagsTrackRef) {
      tagsTrackRef.style.transform = 'translateX(0px)'; // Reset scroll position
    }
    // console.log('Stopped tag scroll animation');
  }

  function handleMouseEnter() {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(() => {
      startTagScroll();
    }, 500); // 0.5 second delay
  }

  function handleMouseLeave() {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    stopTagScroll();
  }

  onDestroy(() => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    stopTagScroll(); // Ensure animation is stopped if component is destroyed while hovering
  });

  // Placeholder for any card-specific GSAP animations if needed in the future,
  // for now, the main reveal might be handled by the parent slider or CSS.
  // Hover effects are primarily CSS-driven as per original FeaturedSlider.
</script>

<div role="group" aria-label={recipe.title} class="expanding-recipe-card" bind:this={cardRef} on:mouseenter={handleMouseEnter} on:mouseleave={handleMouseLeave}>
  <div class="card-image-container">
    {#if recipe.image}<img src={recipe.image} alt={recipe.title} />{:else}<p>Recipe image unavailable</p>{/if}
  </div>
  <div class="card-content-slider">
    <h3 class="card-title-slider"><a href={recipePath(recipe)}>{recipe.title}</a></h3>
    <p class="card-description-slider">{recipe.description}</p>
    <div class="additional-details">
      <div class="recipe-meta-slider">
        <div class="meta-item-slider">
          <span class="meta-icon-slider">⏱️</span>
          <span>{recipe.prepTime} Prep</span>
        </div>
        <div class="meta-item-slider">
          <span class="meta-icon-slider">🍳</span>
          <span>{recipe.cookTime} Cook</span>
        </div>
        <div class="meta-item-slider difficulty-display">
          {#if normalizedDifficulty === 'easy'}
            <span class="meta-icon-slider difficulty-easy">🧑‍🍳</span>
            <span>Easy</span>
          {:else if normalizedDifficulty === 'medium'}
            <span class="meta-icon-slider difficulty-medium">🧑‍🍳🧑‍🍳</span>
            <span>Medium</span>
          {:else if normalizedDifficulty === 'hard'}
            <span class="meta-icon-slider difficulty-hard">🧑‍🍳🧑‍🍳🧑‍🍳</span>
            <span>Hard</span>
          {:else}
            <span class="meta-icon-slider">📊</span> <!-- Fallback icon -->
            <span>{recipe.difficulty || 'N/A'}</span> <!-- Display original or N/A -->
          {/if}
        </div>
      </div>
      <div class="tags-slider-viewport" bind:this={tagsViewportRef}>
        <div class="tags-track" bind:this={tagsTrackRef}>
          {#if recipe.tags && recipe.tags.length > 0}
            {#each recipe.tags as tag}
              <span class="tag-slider">{tag}</span>
            {/each}
            {#each recipe.tags as tag} 
              <span class="tag-slider">{tag}</span>
            {/each}
            {#each recipe.tags as tag}
              <span class="tag-slider">{tag}</span>
            {/each}
            {#each recipe.tags as tag}
              <span class="tag-slider">{tag}</span>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  // Styles extracted and adapted from FeaturedSlider.svelte for a single expanding card

  .expanding-recipe-card {
    background-color: #ffffff;
    border: 1px solid #E0E0E0;
    border-radius: 12px;
    padding: 0;
    min-width: var(--recipe-card-min-width, 290px);
    max-width: 330px; 
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), 
                box-shadow 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    display: flex;
    flex-direction: column;
    position: relative; 
    cursor: pointer; // Indicate interactivity

    &:hover {
      transform: translateY(-5px) scale(1.05);
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      z-index: 10; 

      .additional-details {
        opacity: 1;
        max-height: 200px; // Adjust as needed
        margin-top: 15px;
        transition: opacity 0.4s ease-in-out 0.1s, 
                    max-height 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) 0.1s, 
                    margin-top 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) 0.1s;
      }
    }
  }

  .card-image-container {
    width: 100%;
    padding-top: 66.66%; // 3:2 Aspect Ratio
    position: relative;
    overflow: hidden;
    border-radius: 12px 12px 0 0; // Rounded top corners
    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease; 
    }
  }

  .expanding-recipe-card:hover .card-image-container img {
      transform: scale(1.03); // Slight zoom on image container hover
  }

  .card-content-slider {
    padding: 20px;
    display: flex;
    flex-direction: column;
    flex-grow: 1; 
  }

  .card-title-slider a { color: var(--fg, #18181b); }
  .card-title-slider a:focus-visible {
    outline: 2px solid var(--fg, #18181b);
    outline-offset: 2px;
  }

  .card-title-slider {
    font-size: 1.20em; 
    margin: 0 0 8px 0; // Adjusted margin
    color: #212121;
    font-weight: 600;
    line-height: 1.3;
  }

  .card-description-slider {
    font-size: 0.9em;
    color: #555555;
    line-height: 1.5;
    margin-bottom: 12px; 
    // flex-grow: 1; // Let additional-details push it
  }

  .additional-details {
    opacity: 0;
    max-height: 0;
    overflow: hidden;
    transition: opacity 0.3s ease-in-out, 
                max-height 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), 
                margin-top 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    // margin-top is handled by hover
  }
  
  .recipe-meta-slider {
    display: flex;
    flex-wrap: wrap; // Allow wrapping if space is tight
    gap: 10px 15px; // Row and column gap
    margin-bottom: 10px;
    padding-top: 10px;
    border-top: 1px solid #f0f0f0;
    font-size: 0.8em;
    color: #777777;
  }

  .meta-item-slider {
    display: flex;
    align-items: center;
    gap: 5px;
    .meta-icon-slider {
      font-size: 0.9em;

    }
  }

  .tags-slider-viewport {
    overflow: hidden;      // Clips the content of tags-track
    width: 100%;           // Take full width of its container within additional-details
    padding-top: 10px;
    // border-top: 1px solid #f0f0f0; // Optional separator from meta items
  }

  .tags-track {
    display: flex;         // Aligns tags in a row
    gap: 8px;              // Gap between tags
    white-space: nowrap;   // Prevents tags from wrapping to the next line
    width: max-content;    // Allows the track to be as wide as all its tags
    transition: transform 0.1s linear; // Smooth out transform changes slightly
  }

  .tag-slider {
    background-color: #f0f0f0;
    color: #555555;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 0.75em;
    font-weight: 500;
    flex-shrink: 0; // Prevent tags from shrinking if track width is constrained somehow
  }
</style> 