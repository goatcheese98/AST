<script lang="ts">
  import { onMount, tick } from 'svelte';
  import gsap from 'gsap';

  interface Ingredient {
    id: string;
    name: string;
    classes: string;
    style: string; 
    animation: {
      from: gsap.TweenVars;
      to: gsap.TweenVars;
      duration: number;
      delay?: number; 
      randomRotationRange?: { fromMin: number; fromMax: number; toMin: number; toMax: number };
    };
    text?: string; 
  }

  const ingredients: Ingredient[] = [
    {
      id: 'bread-bottom',
      name: 'Bottom Bread Slice',
      classes: 'ingredient bread-slice-style',
      style: 'background-image: linear-gradient(to bottom, #E6C27C 20%, #D4AE6A 100%); height: 25px; z-index: 1; border-radius: 8px 8px 5px 5px; width: 95%;',
      text: 'Bread',
      animation: {
        from: { y: -200, opacity: 0, rotation: -5 },
        to: { y: 0, opacity: 1, rotation: 0, ease: 'bounce.out' },
        duration: 1.2,
      },
    },
    {
      id: 'lettuce-1',
      name: 'Lettuce Leaf',
      classes: 'ingredient lettuce-leaf-style',
      style: 'background-color: #5F8550; height: 20px; width: 105%; z-index: 3; border-radius: 50% 40% 60% 30% / 70% 80% 50% 60%; margin-left: -2.5%; transform: rotate(-3deg);',
      text: 'Lettuce',
      animation: {
        from: { y: -220, opacity: 0, scale: 0.7 },
        to: { y: 0, opacity: 1, scale: 1, ease: 'elastic.out(1, 0.6)' },
        duration: 1.3,
        delay: 0.2,
        randomRotationRange: { fromMin: -45, fromMax: 45, toMin: -5, toMax: 5 },
      },
    },
    {
      id: 'patty',
      name: 'Patty',
      classes: 'ingredient patty-style',
      style: 'background-color: #7A4A3A; height: 30px; width: 88%; z-index: 4; border-radius: 12px;',
      text: 'Patty',
      animation: {
        from: { y: -250, opacity: 0, scaleY: 1.1 },
        to: { y: 0, opacity: 1, scaleY: 1, ease: 'bounce.out' },
        duration: 1.0,
        delay: 0.4,
      },
    },
    {
      id: 'tomato-1',
      name: 'Tomato Slice',
      classes: 'ingredient tomato-slice-style',
      style: 'background-color: #C87A79; height: 12px; width: 80%; z-index: 5; border-radius: 50%;',
      text: 'Tomato',
      animation: {
        from: { y: -280, opacity: 0, scale: 0.8 },
        to: { y: 0, opacity: 1, scale: 1, ease: 'bounce.out' },
        duration: 0.9,
        delay: 0.3,
        randomRotationRange: { fromMin: -30, fromMax: 30, toMin: 0, toMax: 0 },
      },
    },
    {
      id: 'bread-top',
      name: 'Top Bread Slice',
      classes: 'ingredient bread-slice-style',
      style: 'background-image: linear-gradient(to top, #E6C27C 20%, #D4AE6A 100%); height: 25px; z-index: 8; border-radius: 5px 5px 8px 8px; width: 95%;',
      text: 'Bread',
      animation: {
        from: { y: -300, opacity: 0, rotation: 5 },
        to: { y: 0, opacity: 1, rotation: 0, ease: 'bounce.out' },
        duration: 1.2,
        delay: 0.5,
      },
    },
  ];

  let assemblyArea: HTMLDivElement;
  let ingredientRefs: Record<string, HTMLDivElement> = {};

  onMount(async () => {
    await tick();
    if (typeof gsap === 'undefined' || typeof gsap.utils === 'undefined' || typeof gsap.utils.random !== 'function') {
      console.error('GSAP or GSAP utils not fully loaded');
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => console.log('Detailed Sandwich assembly loop complete!'),
      repeat: -1,
      delay: 2,
    });

    ingredients.forEach((ing, index) => {
      const el = ingredientRefs[ing.id];
      if (!el) return;

      let fromVars = { ...ing.animation.from, opacity: 0 };
      let toVars = { ...ing.animation.to, opacity: 1, duration: ing.animation.duration };

      if (ing.animation.randomRotationRange) {
        fromVars.rotation = gsap.utils.random(ing.animation.randomRotationRange.fromMin, ing.animation.randomRotationRange.fromMax, true);
        toVars.rotation = gsap.utils.random(ing.animation.randomRotationRange.toMin, ing.animation.randomRotationRange.toMax, true);
      }

      gsap.set(el, fromVars); 
      tl.to(el, toVars, ing.animation.delay !== undefined ? `+=${ing.animation.delay}` : '>');
      
      const itemBelowId = ingredients[index - 1]?.id;
      const itemBelowEl = itemBelowId ? ingredientRefs[itemBelowId] : null;

      if (itemBelowEl) {
        let squishAmount = 0.95;
        let squishOffsetY = '2px';
        if (ing.id.includes('patty')) { squishAmount = 0.9; squishOffsetY = '4px'; }
        if (ing.id.includes('bread-top')) { squishAmount = 0.88; squishOffsetY = '5px'; }

        tl.to(itemBelowEl, { 
          scaleY: squishAmount, 
          y: squishOffsetY, 
          transformOrigin: 'bottom', 
          duration: 0.15, 
          yoyo: true, 
          repeat: 1, 
          ease: 'power1.inOut' 
        }, "-=" + (ing.animation.duration * 0.7));
      }
    });

    tl.fromTo(assemblyArea, 
      { y: '-5px', rotation: -0.5 }, 
      { y: '0px', rotation: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)', delay: 0.2 }
    , '>');
    
    tl.to({}, {duration: 2});
  });

</script>

<div class="detailed-sandwich-container" bind:this={assemblyArea}>
  <div class="plate"></div>
  <div class="ingredients-stack-detailed">
    {#each ingredients as item (item.id)}
      <div 
        bind:this={ingredientRefs[item.id]}
        id={item.id} 
        class="{item.classes} ingredient-common-styles" 
        style="{item.style} opacity: 0;" > 
        {#if item.text}
          <span class="ingredient-text">{item.text}</span>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
  .detailed-sandwich-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end; 
    min-height: 450px; 
    width: 300px;
    margin: 30px auto;
    padding-bottom: 20px;
    position: relative; 
  }
  .plate {
    width: 280px;
    height: 20px;
    background-color: #E0E0E0; // Light gray plate
    border-radius: 10px 10px 50% 50% / 10px 10px 20px 20px; 
    box-shadow: 0 5px 10px rgba(0,0,0,0.2);
    position: absolute;
    bottom: 0;
    z-index: 0;
  }
  .ingredients-stack-detailed {
    position: relative; 
    width: 180px; /* Relative width for ingredients */
    display: flex;
    flex-direction: column-reverse; 
    align-items: center;
    margin-bottom: 10px; 
  }

  .ingredient-common-styles {
    width: 100%; 
    box-sizing: border-box;
    border: 1px solid rgba(0,0,0,0.05); /* Very subtle border */
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.7em;
    font-weight: 500;
    margin-bottom: -2px; /* Slight overlap for better stacking look */
    text-shadow: 1px 1px 1px rgba(255,255,255,0.1);
  }

  .bread-slice-style {
    border: 1px solid #A07E48; /* Slightly darker golden brown for crust */
    box-shadow: inset 0 0 5px rgba(0,0,0,0.05); /* Subtle inner shadow for depth */
    color: #4F3A21; /* Darker text for bread */
  }
  .patty-style {
     border: 1px solid #503020; /* Darker border for patty */
     box-shadow: inset 0 0 3px rgba(0,0,0,0.1);
     color: #F0E0D0; /* Light text on dark patty */
  }
  .lettuce-leaf-style {
    border: 1px solid #406030; /* Darker green border */
    color: #203018; 
  }
  .tomato-slice-style {
    border: 1px solid #A05050; /* Darker red border */
    color: #401010;
  }

  .ingredient-text {
    position: relative;
    text-align: center;
    width: 100%;
    pointer-events: none; 
  }
</style> 