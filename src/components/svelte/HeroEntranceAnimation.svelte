<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';

  let heroContainer: HTMLElement;
  let mainTitle: HTMLElement;
  let subTitle: HTMLElement;
  let ctaButton: HTMLElement;

  onMount(() => {
    if (!heroContainer || !mainTitle || !subTitle || !ctaButton) return;

    gsap.set([mainTitle, subTitle, ctaButton], { autoAlpha: 0 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from(mainTitle, { y: -50, duration: 1, autoAlpha: 0 })
      .from(subTitle, { y: -30, duration: 0.8, autoAlpha: 0 }, '-=0.6')
      .from(ctaButton, { scale: 0.5, duration: 0.7, autoAlpha: 0 }, '-=0.5')
      .to(heroContainer, {
        boxShadow: '0 10px 30px -10px rgba(0, 123, 255, 0.4)',
        duration: 1.5,
        ease: 'elastic.out(1, 0.5)'
      }, '-=0.5');
      
    // Example of a subtle continuous animation (optional)
    gsap.to(mainTitle, {
        textShadow: '0 0 10px rgba(255,255,255,0.3), 0 0 20px rgba(0,123,255,0.3)',
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: tl.duration() -1 // Start after main animation
    });
  });
</script>

<div class="hero-entrance-container" bind:this={heroContainer}>
  <h1 class="hero-title" bind:this={mainTitle}>SandoHub Delights!</h1>
  <p class="hero-subtitle" bind:this={subTitle}>Discover Your Next Favorite Sandwich.</p>
  <button class="hero-cta" bind:this={ctaButton}>Explore Recipes</button>
</div>

<style lang="scss">
  .hero-entrance-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 60px 20px;
    min-height: 300px; // Adjust as needed
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    border-radius: 12px;
    color: white;
    overflow: hidden; // Important for some animations
    box-shadow: 0 5px 15px rgba(0,0,0,0.2); // Initial subtle shadow
  }

  .hero-title {
    font-size: 3.5rem; // 56px
    font-weight: 700;
    margin-bottom: 15px;
    letter-spacing: -1px;
    // text-transform: uppercase;
    // Visibility will be controlled by GSAP
  }

  .hero-subtitle {
    font-size: 1.5rem; // 24px
    margin-bottom: 30px;
    font-weight: 300;
    opacity: 0.9;
    // Visibility will be controlled by GSAP
  }

  .hero-cta {
    padding: 15px 35px;
    font-size: 1.1rem; // 17.6px
    font-weight: 600;
    color: #007bff;
    background-color: white;
    border: none;
    border-radius: 50px; // Pill shape
    cursor: pointer;
    transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
    // Visibility will be controlled by GSAP

    &:hover {
      transform: translateY(-3px) scale(1.03);
      box-shadow: 0 6px 15px rgba(0,0,0,0.25);
    }
  }
</style> 