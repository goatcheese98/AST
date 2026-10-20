<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import ExpandingRecipeCard from './ExpandingRecipeCard.svelte';
  import type { RecipeItem } from './ExpandingRecipeCard.svelte';

  gsap.registerPlugin(ScrollTrigger);

  const featuredRecipes: RecipeItem[] = [
    {
      id: 1,
      title: 'Ultimate Grilled Cheese',
      image: 'https://via.placeholder.com/300x200/FFD700/000000?Text=Grilled+Cheese',
      description: 'A classic reinvented with three kinds of cheese and a crispy crust.',
      tags: ['Comfort Food', 'Quick', 'Vegetarian'],
      prepTime: '5 mins',
      cookTime: '10 mins',
      servings: 1
    },
    {
      id: 2,
      title: 'Spicy Chorizo Baguette',
      image: 'https://via.placeholder.com/300x200/FF8C00/FFFFFF?Text=Chorizo+Baguette',
      description: 'Fiery chorizo, manchego cheese, and roasted red peppers.',
      tags: ['Spicy', 'Sandwich', 'Hearty'],
      prepTime: '10 mins',
      cookTime: '15 mins',
      servings: 2
    },
    {
      id: 3,
      title: 'Veggie Halloumi Wrap',
      image: 'https://via.placeholder.com/300x200/32CD32/FFFFFF?Text=Halloumi+Wrap',
      description: 'Grilled halloumi, hummus, and a medley of fresh vegetables.',
      tags: ['Vegetarian', 'Healthy', 'Wrap'],
      prepTime: '15 mins',
      cookTime: '10 mins',
      servings: 1
    },
    {
      id: 4,
      title: 'The Gobbler Sandwich',
      image: 'https://via.placeholder.com/300x200/DC143C/FFFFFF?Text=The+Gobbler',
      description: 'Thanksgiving leftovers packed into one amazing sandwich experience.',
      tags: ['Holiday', 'Turkey', 'Comfort Food'],
      prepTime: '10 mins',
      cookTime: '5 mins',
      servings: 1
    },
    {
      id: 5,
      title: 'Avocado Turkey Club',
      image: 'https://via.placeholder.com/300x200/90EE90/000000?Text=Avocado+Club',
      description: 'A healthy and hearty club with fresh avocado and smoked turkey.',
      tags: ['Healthy', 'Club', 'Lunch'],
      prepTime: '15 mins',
      cookTime: '0 mins',
      servings: 1
    }
  ];

  let sliderWrapper: HTMLElement;
  let cardElements: HTMLElement[] = [];

  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (sliderWrapper && cardElements && cardElements.length > 0) {
      gsap.set(cardElements, { 
        autoAlpha: 0, 
        x: 50, 
        y: 30,
        scale: 0.9
      });

      const reveal = gsap.to(cardElements, {
        autoAlpha: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: 1,
        stagger: 0.2,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: sliderWrapper,
          start: 'top 85%', 
        }
      });
      return () => { reveal.scrollTrigger?.kill(); reveal.kill(); };
    }
  });
</script>

<div class="slider-wrapper" bind:this={sliderWrapper}>
  <div class="slider-track">
    {#each featuredRecipes as recipe, i}
      <div class="slider-card" bind:this={cardElements[i]}><ExpandingRecipeCard recipe={recipe} /></div>
    {/each}
  </div>
</div>

<style lang="scss">
  /* Add global box-sizing if not already present in a reset */
  /* For demonstration, adding it here, but ideally it's in a global reset */
  :global(div, article, section, aside, nav, header, footer, main, img, p, h1, h2, h3, h4, h5, h6, span, li, ul, ol) {
    box-sizing: border-box;
  }

  .slider-card { flex: 0 0 100%; min-width: 0; max-width: 330px; --recipe-card-min-width: 0; }

  .slider-wrapper {
    width: 100%;
    min-width: 0;
    overflow: hidden; 
    padding: 20px 0;
    user-select: none; 
  }
  .slider-track {
    display: flex;
    gap: 25px;
    padding: 20px;
    overflow-x: auto; 
    -webkit-overflow-scrolling: touch; 
    scrollbar-width: thin; 
    scrollbar-color: #E0E0E0 #F5F5F5;

    &::-webkit-scrollbar {
      height: 10px;
    }
    &::-webkit-scrollbar-track {
      background: #F5F5F5;
      border-radius: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background: #E0E0E0;
      border-radius: 5px;
      &:hover {
        background: #BDBDBD;
      }
    }
  }

  // All styles previously associated with .recipe-card-slider, 
  // .card-image-container, .card-content-slider, .additional-details, etc., 
  // have been REMOVED from here as they are now encapsulated within ExpandingRecipeCard.svelte.
  // The .slider-wrapper and .slider-track styles remain as they manage the carousel mechanism.
</style> 