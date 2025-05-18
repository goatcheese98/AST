<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';

  // Props: title, subtitle, backgroundImage, ctaText, ctaLink, etc.
  // Data fetched from Directus will be passed as props.
  export let title: string = 'Discover Amazing Recipes';
  export let subtitle: string = 'Your daily dose of culinary inspiration.';
  export let ctaText: string = 'Explore Now';
  export let ctaLink: string = '/recipes'; // Example link
  // Placeholder for background image - in a real scenario, this would come from Directus or a prop
  const backgroundImageUrl = 'https://images.pexels.com/photos/1647163/pexels-photo-1647163.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'; // Different sandwich image


  onMount(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      '.hero-title-animate',
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    )
      .fromTo(
        '.hero-subtitle-animate',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
        '-=0.5' // Starts 0.5s after the previous animation starts
      )
      .fromTo(
        '.hero-cta-animate',
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' },
        '-=0.4' // Starts 0.4s after the previous animation starts
      );
  });
</script>

<section class="hero-animation" style="background-image: url('{backgroundImageUrl}');">
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <h1 class="hero-title-animate">{title}</h1>
    <p class="hero-subtitle-animate">{subtitle}</p>
    <a href="{ctaLink}" class="hero-cta-animate button">{ctaText}</a>
  </div>
</section>

<style lang="scss">
  .hero-animation {
    min-height: 70vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
    position: relative;
    background-size: cover;
    background-position: center;
    color: white; // Text color that works well with dark overlays or vibrant images
    overflow: hidden; // Prevent content spill during animations

    &::before { // Optional: Dark overlay for better text readability
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5); // Adjust opacity as needed
      z-index: 1;
    }
  }

  .hero-content {
    position: relative;
    z-index: 2; // Ensure content is above the overlay
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem; // Space between elements
  }

  .hero-title-animate {
    font-size: clamp(2.5rem, 5vw, 4.5rem); // Responsive font size
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: #fff;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  }

  .hero-subtitle-animate {
    font-size: clamp(1rem, 2.5vw, 1.5rem); // Responsive font size
    margin-bottom: 1.5rem;
    color: #f0f0f0;
     text-shadow: 1px 1px 3px rgba(0,0,0,0.2);
  }

  .hero-cta-animate.button {
    padding: 0.75rem 1.5rem;
    background-color: #ff6347; // Example: Tomato color
    color: white;
    text-decoration: none;
    border-radius: 25px; // Rounded corners
    font-weight: bold;
    font-size: clamp(0.9rem, 2vw, 1.1rem);
    transition: background-color 0.3s ease, transform 0.2s ease;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);

    &:hover {
      background-color: #e5533d; // Darker shade on hover
      transform: translateY(-2px); // Slight lift on hover
    }
  }
</style> 