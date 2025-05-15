<script lang="ts">
  import { onMount, tick } from 'svelte';
  import gsap from 'gsap';

  interface Ingredient {
    id: string;
    name: string;
    color: string;
    height: number; // in px
    delay: number; // animation delay
    classes?: string;
  }

  const ingredients: Ingredient[] = [
    { id: 'bottom-bun', name: 'Bottom Bun', color: '#D4A373', height: 30, delay: 0, classes: 'bun-style' },
    { id: 'patty', name: 'Patty', color: '#774936', height: 25, delay: 0.3, classes: 'patty-style' },
    { id: 'cheese', name: 'Cheese', color: '#FFD700', height: 10, delay: 0.2, classes: 'cheese-style' },
    { id: 'lettuce', name: 'Lettuce', color: '#80B918', height: 20, delay: 0.4, classes: 'lettuce-style' },
    { id: 'tomato', name: 'Tomato', color: '#EE6352', height: 15, delay: 0.3, classes: 'tomato-style' },
    { id: 'top-bun', name: 'Top Bun', color: '#D4A373', height: 30, delay: 0.5, classes: 'bun-style' },
  ];

  let ingredientRefs: Record<string, HTMLDivElement> = {};

  onMount(async () => {
    await tick();
    
    if (typeof gsap === 'undefined') {
      console.error('GSAP not loaded in SandwichStacker');
      return;
    }

    const tl = gsap.timeline({ repeat: -1, delay: 1 }); // Add repeat: -1 here, and a slight delay before repeating

    ingredients.forEach(ingredient => {
      const el = ingredientRefs[ingredient.id];
      if (el) {
        tl.fromTo(el, 
          { y: -200, opacity: 0, scale: 0.8, rotation: gsap.utils.random(-20, 20) }, 
          { 
            y: 0, 
            opacity: 1, 
            scale: 1,
            rotation: 0,
            duration: 0.8, 
            ease: 'bounce.out',
          },
          `+=${ingredient.delay}`
        );
      } else {
        console.warn(`Element for ${ingredient.id} not found`);
      }
    });

    // Add a brief pause at the end before it repeats if desired, or clear an onStart
    tl.to({}, {duration: 2}); // Pause for 2 seconds before repeating
  });

</script>

<div class="sandwich-stacker-container">
  <div class="ingredients-wrapper">
    {#each ingredients as ing (ing.id)}
      <div 
        bind:this={ingredientRefs[ing.id]} 
        class="ingredient {ing.classes || ''}"
        style="background-color: {ing.color}; height: {ing.height}px; opacity: 0;" 
      >
        {ing.name}
      </div>
    {/each}
  </div>
  <div class="plate-stand"></div>
</div>

<style>
  .sandwich-stacker-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end; /* Stack from bottom */
    width: 200px;
    height: 300px; /* Adjust as needed */
    position: relative;
    /* border: 1px solid #ccc; */
    padding-top: 50px; /* Space for items to fall from */
  }

  .ingredients-wrapper {
    display: flex;
    flex-direction: column-reverse; /* Stack correctly */
    align-items: center;
    width: 100%;
  }

  .ingredient {
    width: 80%; /* Common width */
    margin-bottom: -3px; /* Slight overlap for stacking */
    border: 1px solid rgba(0,0,0,0.2);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.8em;
    color: white;
    text-shadow: 1px 1px 1px rgba(0,0,0,0.4);
    opacity: 0; /* Start hidden, GSAP will reveal */
    transform-origin: center bottom;
  }

  .bun-style {
    border-radius: 15px 15px 5px 5px; /* Top bun styling */
    /* Special for bottom bun to be reversed if needed */
  }
  /* If bottom bun needs different radius for top edges */
  /* .bun-style:first-child { border-radius: 5px 5px 15px 15px; } */

  .patty-style {
    border-radius: 8px;
  }
  .cheese-style {
    border-radius: 2px;
    width: 85%; /* Slightly wider to drape */
  }
  .lettuce-style {
    border-radius: 50% 30% 50% 30% / 80% 60% 70% 40%; /* Organic shape */
    width: 90%;
    filter: brightness(0.9);
  }
  .tomato-style {
    border-radius: 50%; /* Circular */
  }

  .plate-stand {
    width: 180px;
    height: 15px;
    background-color: #EAEAEA;
    border-radius: 8px 8px 0 0; 
    position: absolute;
    bottom: 0;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }
</style> 