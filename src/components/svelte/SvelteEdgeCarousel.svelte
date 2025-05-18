<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import ExpandingRecipeCard from './ExpandingRecipeCard.svelte';
  import type { RecipeItem } from './ExpandingRecipeCard.svelte';

  export let items: RecipeItem[] = [];
  export let carouselTitle: string = 'Svelte Edge Carousel';
  export let maxSpeed: number = 8; // Max speed of scrolling in pixels per frame
  export let acceleration: number = 0.2; // How quickly it reaches maxSpeed (0.01 - 1)
  export let deceleration: number = 0.92; // Factor for slowing down (e.g., 0.95 means 5% speed reduction per frame)
  
  let carouselWrapperEl: HTMLDivElement;
  let viewportEl: HTMLDivElement | null;
  let trackEl: HTMLDivElement | null;
  let triggerLeftEl: HTMLDivElement | null;
  let triggerRightEl: HTMLDivElement | null;

  let currentSpeed = 0;
  let activeHoverDirection = 0; // -1 for left, 0 for none, 1 for right
  let animationFrameId: number | null = null;

  const startMomentumScroll = () => {
    if (animationFrameId) return; // Already running
    console.log('[SVELTE CAROUSEL] Starting momentum scroll loop');
    
    const scrollLoop = () => {
      if (!trackEl || !viewportEl) {
        console.error('[SVELTE CAROUSEL] Track or Viewport missing in scrollLoop.');
        currentSpeed = 0;
        activeHoverDirection = 0;
        animationFrameId = null;
        return;
      }

      if (activeHoverDirection !== 0) {
        // Accelerate towards maxSpeed in the hover direction
        let targetSpeed = maxSpeed * activeHoverDirection;
        currentSpeed += (targetSpeed - currentSpeed) * acceleration;
      } else {
        // Decelerate
        currentSpeed *= deceleration;
      }

      // Stop if speed is negligible
      if (Math.abs(currentSpeed) < 0.1) {
        currentSpeed = 0;
      }

      if (currentSpeed !== 0) {
        const currentScroll = trackEl.scrollLeft;
        const scrollWidth = trackEl.scrollWidth;
        const viewportWidth = viewportEl.clientWidth;
        let newScrollLeft = currentScroll + currentSpeed;

        // Boundary checks and stop momentum if hitting edges
        if (newScrollLeft <= 0) {
          newScrollLeft = 0;
          currentSpeed = 0; // Stop momentum at edge
          console.log('[SVELTE CAROUSEL] Hit left edge, stopping momentum.');
        }
        if (newScrollLeft >= scrollWidth - viewportWidth) {
          newScrollLeft = scrollWidth - viewportWidth;
          currentSpeed = 0; // Stop momentum at edge
          console.log('[SVELTE CAROUSEL] Hit right edge, stopping momentum.');
        }
        trackEl.scrollLeft = newScrollLeft;
      }

      // Continue loop if there's speed or active hover that might generate speed
      if (currentSpeed !== 0 || activeHoverDirection !== 0) {
        animationFrameId = requestAnimationFrame(scrollLoop);
      } else {
        console.log('[SVELTE CAROUSEL] Stopping momentum scroll loop.');
        animationFrameId = null; // Stop the loop
      }
    };
    animationFrameId = requestAnimationFrame(scrollLoop);
  };

  const stopMomentumScrollLoop = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
      console.log('[SVELTE CAROUSEL] Force stopped momentum scroll loop.');
    }
  };

  onMount(() => {
    console.log('[SVELTE CAROUSEL] Component Mounted');
    if (!carouselWrapperEl) {
      console.error('[SVELTE CAROUSEL] carouselWrapperEl not bound!');
      return;
    }

    viewportEl = carouselWrapperEl.querySelector('.carousel-viewport');
    trackEl = carouselWrapperEl.querySelector('.carousel-track');
    triggerLeftEl = carouselWrapperEl.querySelector('.scroll-trigger-left');
    triggerRightEl = carouselWrapperEl.querySelector('.scroll-trigger-right');

    if (!viewportEl || !trackEl || !triggerLeftEl || !triggerRightEl) {
      console.error('[SVELTE CAROUSEL] Missing one or more essential child elements.');
      return;
    }

    console.log(`[SVELTE CAROUSEL] Config: maxSpeed=${maxSpeed}, accel=${acceleration}, decel=${deceleration}`);

    const handleMouseEnter = (direction: number) => {
      console.log(`[SVELTE CAROUSEL] Mouse enter trigger: direction ${direction}`);
      activeHoverDirection = direction;
      if (!animationFrameId) {
        startMomentumScroll();
      }
    };

    const handleMouseLeave = () => {
      console.log('[SVELTE CAROUSEL] Mouse leave trigger/viewport');
      activeHoverDirection = 0;
      if (!animationFrameId && currentSpeed !== 0) {
         startMomentumScroll(); 
      }
    };

    triggerLeftEl!.addEventListener('mouseenter', () => handleMouseEnter(-1));
    triggerLeftEl!.addEventListener('mouseleave', handleMouseLeave);

    triggerRightEl!.addEventListener('mouseenter', () => handleMouseEnter(1));
    triggerRightEl!.addEventListener('mouseleave', handleMouseLeave);

    viewportEl!.addEventListener('mouseleave', (event: MouseEvent) => {
      if (!triggerLeftEl!.contains(event.relatedTarget as Node) && 
          !triggerRightEl!.contains(event.relatedTarget as Node)) {
        handleMouseLeave();
      }
    });

    console.log('[SVELTE CAROUSEL] Event listeners attached.');
  });

  onDestroy(() => {
    console.log('[SVELTE CAROUSEL] Component Unmounted, cleaning up animation frame.');
    stopMomentumScrollLoop();
  });
</script>

<div class="edge-hover-carousel-wrapper svelte-carousel-instance" bind:this={carouselWrapperEl}>
  {#if carouselTitle}
    <h2 class="carousel-title">{carouselTitle}</h2>
  {/if}
  <div class="carousel-viewport"> 
    <div class="scroll-trigger scroll-trigger-left"></div>
    <div class="carousel-track">
      {#each items as item (item.id)}
        <div class="carousel-item-wrapper">
          <ExpandingRecipeCard recipe={item} />
        </div>
      {/each}
    </div>
    <div class="scroll-trigger scroll-trigger-right"></div>
  </div>
</div>

<style lang="scss">
  /* Styles are identical to EdgeHoverCarousel.astro for consistency */
  .edge-hover-carousel-wrapper {
    width: 100%;
    margin-bottom: 2rem;
  }

  .carousel-title {
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--color-text-primary, #333);
    margin-bottom: 1rem;
    padding-left: 10px;
  }

  .carousel-viewport {
    position: relative;
    width: 100%;
    overflow: hidden;
  }

  .carousel-track {
    display: flex;
    gap: 20px;
    padding: 10px;
    overflow-x: auto; /* Fallback for touch, non-JS */
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .carousel-item-wrapper {
    flex-shrink: 0;
  }

  .scroll-trigger {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 10%; 
    max-width: 80px;
    z-index: 20;
    cursor: pointer;

    &.scroll-trigger-left {
      left: 0;
    }
    &.scroll-trigger-right {
      right: 0;
    }
  }
</style> 