<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';

  // Props: title, subtitle, backgroundImage, ctaText, ctaLink, etc.
  // Data fetched from Directus will be passed as props.
  export let title: string = 'Hero Title';

  onMount(() => {
    // GSAP entrance animation for hero elements
    // e.g., gsap.fromTo('.hero-title-animate', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
  });
</script>

<section class="hero-animation">
  <h1 class="hero-title-animate">{title}</h1>
  <!-- More content here: subtitle, image, CTA -->
</section>

<style lang="scss">
  .hero-animation {
    min-height: 70vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
    background-color: #eee; // Placeholder
    overflow: hidden;
  }
  .hero-title-animate {
    font-size: 3.5rem;
    // Add specific styling
  }
</style> 