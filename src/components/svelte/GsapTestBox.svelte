<script lang="ts">
  import { onMount } from 'svelte';
  import gsap from 'gsap';

  let box: HTMLDivElement | undefined = undefined;

  onMount(() => {
    const tl = gsap.timeline({ repeat: -1, yoyo: true });

    tl.to('.gsap-box', {
      x: 200,
      opacity: 0.5,
      backgroundColor: '#FF6347', // Tomato red
      rotation: 360,
      duration: 2,
      ease: 'power2.inOut'
    })
    .to('.gsap-box', {
      scale: 1.5,
      duration: 1,
      ease: 'elastic.out(1, 0.3)'
    })
    .to('.gsap-box', {
      x: 0,
      opacity: 1,
      backgroundColor: '#4CAF50', // Green
      rotation: 0,
      scale: 1,
      duration: 2,
      ease: 'power2.inOut'
    });
  });
</script>

<div bind:this={box} class="gsap-box">
  GSAP Test Box
</div>

<style>
  .gsap-box {
    width: 100px;
    height: 100px;
    background-color: red; /* Initial color */
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
  }
</style> 