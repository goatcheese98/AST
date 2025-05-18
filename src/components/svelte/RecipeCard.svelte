<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';

  interface RecipeData {
    id: string;
    title: string;
    imageUrl: string;
    description: string;
    tags: string[];
    prepTime: string;
    cookTime: string;
    servings: number;
  }

  // Sample Data for one recipe card
  export let recipe: RecipeData = {
    id: 'classic-blt',
    title: 'The Perfect Classic BLT',
    imageUrl: 'https://via.placeholder.com/400x300/FFC0CB/000000?Text=Delicious+BLT',
    description: 'Crisp bacon, fresh lettuce, and ripe tomatoes layered between perfectly toasted bread. A timeless classic for a reason!',
    tags: ['Sandwich', 'Classic', 'Lunch', 'Easy'],
    prepTime: '10 mins',
    cookTime: '5 mins',
    servings: 1
  };

  // In a real app, you might pass the recipe data as a prop
  // export let recipe: RecipeData;

  let cardElement: HTMLElement;

  onMount(() => {
    if (!cardElement) return;

    // Staggered reveal animation for card contents
    const tl = gsap.timeline({
      defaults: { opacity: 0, ease: 'power3.out' },
      scrollTrigger: {
        trigger: cardElement,
        start: 'top bottom-=100px', // Start animation when card is 100px from bottom of viewport
        toggleActions: 'play none none none', // Play once on enter
        once: true, // Ensure it only plays once
      }
    });

    tl.from(cardElement.querySelector('.card-image-animate'), { y: 40, duration: 0.7 })
      .from(cardElement.querySelector('.card-title-animate'), { y: 30, duration: 0.6 }, '-=0.5')
      .from(cardElement.querySelector('.card-description-animate'), { y: 25, duration: 0.5 }, '-=0.4')
      .from(cardElement.querySelectorAll('.meta-item-animate'), { y: 20, stagger: 0.15, duration: 0.4 }, '-=0.3')
      .from(cardElement.querySelector('.button-animate'), { scale: 0.8, duration: 0.5 }, '-=0.3');
  });
</script>

<article class="recipe-card" bind:this={cardElement}>
  <div class="card-image-wrapper card-image-animate">
    <img src={recipe.imageUrl} alt={`Photo of ${recipe.title}`} class="card-image" />
    <div class="tags-overlay">
      {#each recipe.tags.slice(0, 2) as tag}
        <span class="tag">{tag}</span>
      {/each}
    </div>
  </div>

  <div class="card-content">
    <h3 class="card-title card-title-animate">{recipe.title}</h3>
    <p class="card-description card-description-animate">{recipe.description}</p>
    
    <div class="recipe-meta">
      <div class="meta-item meta-item-animate">
        <span class="meta-icon">⏱️</span> <!-- Or an SVG icon -->
        <span>{recipe.prepTime} Prep</span>
      </div>
      <div class="meta-item meta-item-animate">
        <span class="meta-icon">🍳</span> <!-- Or an SVG icon -->
        <span>{recipe.cookTime} Cook</span>
      </div>
      <div class="meta-item meta-item-animate">
        <span class="meta-icon">👥</span> <!-- Or an SVG icon -->
        <span>{recipe.servings} Servings</span>
      </div>
    </div>

    <a href={`/recipes/${recipe.id}`} class="view-recipe-button button-animate">
      View Recipe
    </a>
  </div>
</article>

<style lang="scss">
  .recipe-card {
    background-color: #fff;
    border-radius: 16px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05), 0 4px 8px rgba(0,0,0,0.04);
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    flex-direction: column;
    max-width: 360px; // Or adjust as needed for your layout
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08), 0 6px 12px rgba(0,0,0,0.06);
    }
  }

  .card-image-wrapper {
    position: relative;
    width: 100%;
    padding-top: 75%; // 4:3 Aspect ratio for the image
    overflow: hidden;

    .card-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    &:hover .card-image {
      transform: scale(1.05);
    }
  }

  .tags-overlay {
    position: absolute;
    top: 12px;
    left: 12px;
    display: flex;
    gap: 6px;

    .tag {
      background-color: rgba(0, 0, 0, 0.6);
      color: #fff;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
      backdrop-filter: blur(2px);
    }
  }

  .card-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    flex-grow: 1; // Allows button to be pushed to bottom if content height varies
  }

  .card-title {
    font-size: 1.5rem; // 24px
    font-weight: 700;
    color: #222;
    margin: 0 0 10px;
    line-height: 1.3;
  }

  .card-description {
    font-size: 0.9rem; // 14.4px
    color: #555;
    line-height: 1.6;
    margin-bottom: 16px;
    flex-grow: 1; // Pushes content below it (like meta & button) down
  }

  .recipe-meta {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 20px;
    border-top: 1px solid #f0f0f0;
    padding-top: 12px;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    color: #777;

    .meta-icon {
      font-size: 1rem; // Adjust if using actual SVG icons
    }
  }

  .view-recipe-button {
    display: inline-block;
    background-color: #ff6f61; // A warm, inviting color
    color: #fff;
    text-align: center;
    padding: 12px 20px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.95rem;
    transition: background-color 0.2s ease, transform 0.2s ease;
    margin-top: auto; // Pushes button to the bottom of the card content

    &:hover {
      background-color: #e65a50;
      transform: scale(1.02);
    }
  }
</style> 