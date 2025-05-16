<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import SplitText from 'gsap/SplitText';

  let logoContainerEl;
  let sandoHubText = "Sando Hub";
  let initialFallTimeline = null;
  let hoverDistortTimeline = null;
  let splitInstance = null;
  // Use the same brown as defined in _variables.scss (v.$color-dark-earthy-text)
  const unifiedBrown = '#5D4037'; 

  onMount(() => {
    gsap.registerPlugin(SplitText);

    if (!logoContainerEl) return;

    const textEl = logoContainerEl.querySelector('.text');
    const sliceEl = logoContainerEl.querySelector('.slice-effect');

    if (textEl.textContent.trim() === "") {
        textEl.textContent = sandoHubText;
    }
    splitInstance = new SplitText(textEl, { type: "chars" });
    const chars = splitInstance.chars;

    gsap.set(chars, { color: unifiedBrown });

    initialFallTimeline = gsap.timeline();
    initialFallTimeline.set(chars, { opacity: 0, y: -50, color: unifiedBrown });
    initialFallTimeline.to(chars, {
      duration: 0.8,
      opacity: 1,
      y: 0,
      color: unifiedBrown,
      stagger: 0.05,
      ease: "elastic.out(1, 0.5)",
    });

    hoverDistortTimeline = gsap.timeline({
      paused: true,
      onReverseComplete: () => {
        if (chars && chars.length > 0) {
             gsap.set(chars, {
                opacity: 1, 
                y: 0, 
                skewX: 0, 
                scale: 1, 
                color: unifiedBrown, // Revert to unifiedBrown
                clearProps: "filter,transformOrigin"
            });
        }
        if (sliceEl) {
            gsap.set(sliceEl, { opacity: 0, xPercent: -105, scaleY: 0.8, skewX: -30, display: 'none' });
        }
      }
    });

    gsap.set(sliceEl, {
        opacity: 0, xPercent: -105, scaleY: 0.8, skewX: -30, display: 'none',
        transformOrigin: "center center"
    });

    hoverDistortTimeline.addLabel("startHoverEffect");
    hoverDistortTimeline.to(sliceEl, {
      display: 'block',
      duration: 0.3,
      xPercent: 105,
      opacity: 1,
      scaleY: 1,
      ease: "power2.inOut",
    }, "startHoverEffect") 
    .to(sliceEl, {
        duration: 0.2,
        opacity: 0,
        ease: "power2.out",
        onComplete: () => {
            gsap.set(sliceEl, { display: 'none' });
        }
    }, ">-0.1");

    const sliceAnimationStartTime = "startHoverEffect+=0.05";
    chars.forEach((char, index) => {
      const distortionDelay = index * 0.03;
      hoverDistortTimeline.to(char, {
        duration: 0.4,
        skewX: (Math.random() - 0.5) * 70,
        scale: 1 + Math.random() * 0.7,
        y: (Math.random() - 0.5) * 20,
        color: gsap.utils.random(["#FF4500", "#FF6347", "#FF7F50", "#FFA500", "#FFD700"]),
        ease: "elastic.out(1, 0.6)",
        transformOrigin: "center center"
      }, sliceAnimationStartTime + "+=" + distortionDelay);
    });

    return () => {
      if (splitInstance) splitInstance.revert();
      if (initialFallTimeline) initialFallTimeline.kill();
      if (hoverDistortTimeline) hoverDistortTimeline.kill();
      initialFallTimeline = null;
      hoverDistortTimeline = null;
      splitInstance = null;
    };
  });

  function handleMouseEnter() {
    if (hoverDistortTimeline && splitInstance && splitInstance.chars) {
      gsap.set(splitInstance.chars, {
        opacity: 1,
        y: 0,
        skewX: 0,
        scale: 1,
        color: unifiedBrown, // Use unifiedBrown
        clearProps: "filter,transformOrigin"
      });
      const sliceEl = logoContainerEl.querySelector('.slice-effect');
      if (sliceEl) {
        gsap.set(sliceEl, { opacity: 0, xPercent: -105, scaleY: 0.8, skewX: -30, display: 'none' });
      }
      hoverDistortTimeline.restart();
    }
  }

  function handleMouseLeave() {
    if (hoverDistortTimeline) {
      if (hoverDistortTimeline.progress() > 0 || hoverDistortTimeline.isActive()) {
        hoverDistortTimeline.reverse();
      }
    }
  }
</script>

<div bind:this={logoContainerEl} class="sando-hub-logo-container" on:mouseenter={handleMouseEnter} on:mouseleave={handleMouseLeave}>
  <div class="text">{sandoHubText}</div>
  <div class="slice-effect"></div>
</div>

<style>
  .sando-hub-logo-container {
    display: inline-block;
    font-family: 'Arial', sans-serif;
    font-size: 2rem;
    font-weight: bold;
    /* Base color will be inherited from Header.astro's .site-branding which uses v.$color-dark-earthy-text (#5D4037) */
    /* color: #5D4037; Explicit color here can be removed if Header.astro reliably provides it */
    cursor: pointer;
    position: relative;
    min-width: 200px;
    min-height: 50px;
    user-select: none;
  }

  .text {
    position: relative;
    z-index: 1;
    display: inline-block;
    white-space: nowrap;
    /* No !important needed now, should inherit or be set by GSAP consistently */
    /* color: #5D4037; */ 
  }

  .slice-effect {
    position: absolute;
    top: 0%;
    left: 0;
    width: 12px;
    height: 100%;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 224, 0.5) 0%,
      rgba(255, 255, 255, 0.9) 30%,
      rgba(255, 255, 255, 0.9) 70%,
      rgba(255, 255, 224, 0.5) 100%
    );
    box-shadow: 0 0 8px 4px rgba(255, 255, 240, 0.6);
    border-radius: 2px;
    z-index: 2;
    display: none; 
    opacity: 0; 
  }
</style> 