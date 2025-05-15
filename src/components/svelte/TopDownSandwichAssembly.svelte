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
      rotationRange?: { min: number; max: number }; 
    };
    text?: string; 
  }

  const ingredients: Ingredient[] = [
    {
      id: 'plate-top-down',
      name: 'Plate',
      classes: 'plate-visual-top-down',
      style: 'width: 280px; height: 280px; background-color: #E0E0E0; border-radius: 50%; z-index: 0; box-shadow: 0 3px 8px rgba(0,0,0,0.2);',
      animation: {
        from: { opacity: 0, scale: 0.7 },
        to: { opacity: 1, scale: 1, ease: 'power2.out' },
        duration: 0.8,
      },
    },
    {
      id: 'bread-bottom-td',
      name: 'Bottom Bread (Square)',
      classes: 'ingredient-td bread-slice-td',
      style: 'width: 170px; height: 170px; background-image: linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.01) 100%), linear-gradient(to bottom, #EAC07A, #D8B070), radial-gradient(circle at 15% 25%, rgba(0,0,0,0.08) 1px, transparent 2px), radial-gradient(circle at 80% 30%, rgba(0,0,0,0.07) 1.5px, transparent 2.5px), radial-gradient(circle at 40% 50%, rgba(0,0,0,0.06) 1px, transparent 2px), radial-gradient(circle at 60% 75%, rgba(0,0,0,0.05) 1.2px, transparent 2.2px), radial-gradient(circle at 22% 80%, rgba(0,0,0,0.07) 1px, transparent 1.5px), radial-gradient(circle at 70% 10%, rgba(0,0,0,0.06) 1.5px, transparent 2.5px), radial-gradient(circle at 50% 15%, rgba(0,0,0,0.05) 0.8px, transparent 1.8px), radial-gradient(circle at 35% 35%, rgba(0,0,0,0.04) 1.2px, transparent 2.2px); border-radius: 8px; z-index: 1; border: 3px solid #A07855;',
      animation: {
        from: { opacity: 0, scale: 0.5 },
        to: { opacity: 1, scale: 1, x: 0, y: 0, rotation: 0, ease: 'back.out(1.4)' },
        duration: 0.7,
        delay: 0.3,
      },
    },
    {
      id: 'mayo-swirl-td',
      name: 'Mayo Swirl',
      classes: 'ingredient-td sauce-td',
      style: 'width: 150px; height: 150px; background-image: radial-gradient(circle, rgba(255,253,208,0.9) 30%, transparent 70%); border-radius: 50%; z-index: 2; opacity:0;',
      animation: {
        from: { opacity: 0, scale: 0.2, rotation: -90 },
        to: { opacity: 0.8, scale: 1, x: 0, y: 0, rotation: 0, ease: 'power2.inOut' },
        duration: 0.8,
        delay: 0.2,
      },
    },
    {
      id: 'chicken-breast-td',
      name: 'Chicken Breast',
      classes: 'ingredient-td chicken-breast-td-style',
      style: 'width: 150px; height: 155px; background-color: #F3E7D7; background-image: linear-gradient(45deg, rgba(150,100,80,0.15) 25%, transparent 25%, transparent 50%, rgba(150,100,80,0.15) 50%, rgba(150,100,80,0.15) 75%, transparent 75%, transparent), radial-gradient(ellipse at 30% 70%, rgba(80,50,40,0.3) 0%, transparent 30%), radial-gradient(ellipse at 70% 30%, rgba(80,50,40,0.25) 0%, transparent 25%), radial-gradient(ellipse at 50% 50%, rgba(100,70,60,0.1) 0%, transparent 40%); background-size: 15px 15px, auto, auto, auto; border-radius: 50% 50% 30% 30% / 60% 60% 40% 40%; z-index: 3; border: 1px solid #C8A880;',
      animation: {
        from: { opacity: 0, scale: 0.7 },
        to: { opacity: 1, scale: 1, x: 0, y: 0, rotation: 0, ease: 'bounce.out' },
        duration: 0.9,
        delay: 0.3, 
      },
    },
    {
      id: 'bacon-strip-1-td',
      name: 'Bacon Strip 1',
      classes: 'ingredient-td bacon-strip-td',
      style: 'width: 155px; height: 30px; z-index: 4;',
      animation: {
        from: { opacity: 0, x: -80, rotation: -45 },
        to: { opacity: 1, x: -20, y: 0, rotation: -15, ease: 'power2.out' }, 
        duration: 0.6,
        delay: 0.2, 
      },
    },
    {
      id: 'bacon-strip-2-td',
      name: 'Bacon Strip 2',
      classes: 'ingredient-td bacon-strip-td',
      style: 'width: 155px; height: 30px; z-index: 4;',
      animation: {
        from: { opacity: 0, x: 80, rotation: 45 },
        to: { opacity: 1, x: 20, y: 5, rotation: 20, ease: 'power2.out' }, 
        duration: 0.6,
        delay: 0.1, 
      },
    },
    {
      id: 'lettuce-td-1',
      name: 'Lettuce Leaf',
      classes: 'ingredient-td lettuce-leaf-td',
      style: 'width: 160px; height: 160px; background-color: #7BAF3B; background-image: linear-gradient(135deg, rgba(255,255,255,0.12) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.12) 75%, transparent 75%, transparent), linear-gradient(45deg, rgba(0,0,0,0.08) 20%, transparent 20%); background-size: 10px 10px, 8px 8px; border-radius: 45% 55% 40% 60% / 60% 50% 55% 45%; z-index: 5;',
      animation: {
        from: { opacity: 0, scale: 0.6, y: -30 }, 
        to: { opacity: 1, scale: 1, x: 0, y: -5, rotation: 15, ease: 'elastic.out(1, 0.7)' }, 
        duration: 1.0,
        delay: 0.2, 
      },
    },
    {
      id: 'cheese-td',
      name: 'Cheese Slice',
      classes: 'ingredient-td cheese-slice-td',
      style: 'width: 155px; height: 155px; background-color: #FFD133; background-image: radial-gradient(rgba(255,255,255,0.08) 0.5px, transparent 0.5px), radial-gradient(rgba(0,0,0,0.03) 0.5px, transparent 0.5px); background-size: 5px 5px, 3px 3px; background-position: 0 0, 1.5px 1.5px; z-index: 6; border-radius: 8px; border: 1px solid #E6BB00;',
      animation: {
        from: { opacity: 0, y: -80, rotation: 30, scale:0.7 },
        to: { opacity: 0.9, x:0, y: 0, rotation: -5, scale:1, ease: 'back.out(1.2)' },
        duration: 0.8,
        delay: 0.1, 
      },
    },
    {
      id: 'bread-top-td',
      name: 'Top Bread (Square)',
      classes: 'ingredient-td bread-slice-td',
      style: 'width: 170px; height: 170px; background-image: linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.01) 100%), linear-gradient(to top, #EAC07A, #D8B070), radial-gradient(circle at 20% 20%, rgba(0,0,0,0.08) 1px, transparent 2px), radial-gradient(circle at 78% 28%, rgba(0,0,0,0.07) 1.5px, transparent 2.5px), radial-gradient(circle at 45% 55%, rgba(0,0,0,0.06) 1px, transparent 2px), radial-gradient(circle at 65% 70%, rgba(0,0,0,0.05) 1.2px, transparent 2.2px), radial-gradient(circle at 18% 82%, rgba(0,0,0,0.07) 1px, transparent 1.5px), radial-gradient(circle at 75% 15%, rgba(0,0,0,0.06) 1.5px, transparent 2.5px), radial-gradient(circle at 55% 10%, rgba(0,0,0,0.05) 0.8px, transparent 1.8px), radial-gradient(circle at 30% 40%, rgba(0,0,0,0.04) 1.2px, transparent 2.2px); border-radius: 8px; z-index: 7; border: 3px solid #A07855;',
      animation: {
        from: { opacity: 0, scale: 0.5, y: -50 },
        to: { opacity: 1, scale: 1, x:0, y: 0, rotation:0, ease: 'bounce.out' },
        duration: 1.0,
        delay: 0.3, 
      },
    },
  ];

  let assemblyContainer: HTMLDivElement;
  let ingredientRefs: Record<string, HTMLDivElement> = {};

  onMount(async () => {
    await tick();
    if (typeof gsap === 'undefined' || !gsap.utils || typeof gsap.utils.random !== 'function') {
      console.error('GSAP or GSAP utils not fully loaded for TopDownSandwichAssembly');
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => console.log('Top-down sandwich loop complete!'),
      repeat: -1, // Loop indefinitely
      delay: 2, // Pause 2 seconds before repeating
    });

    ingredients.forEach((ing) => {
      const el = ingredientRefs[ing.id];
      if (!el) {
        console.warn(`Element ${ing.id} not found in TopDownSandwichAssembly`);
        return;
      }

      let fromVars = { ...ing.animation.from };
      let toVars = { ...ing.animation.to };
      
      // Reset relevant properties for restart
      gsap.set(el, fromVars);
      tl.to(el, toVars, ing.animation.delay !== undefined ? `+=${ing.animation.delay}` : '>');
    });

    // Add a pause at the end of the timeline before it repeats due to repeat: -1
    tl.to({}, {duration: 2});
  });

</script>

<div class="top-down-sandwich-assembly-container" bind:this={assemblyContainer}>
  {#each ingredients as item (item.id)}
    <div 
      bind:this={ingredientRefs[item.id]}
      id={item.id} 
      class="{item.classes} ingredient-base-td" 
      style="{item.style}" 
    >
      <!-- Removed text label display -->
    </div>
  {/each}
</div>

<style lang="scss">
  .top-down-sandwich-assembly-container {
    width: 320px; 
    height: 320px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative; 
    margin: 20px auto;
    background-color: #f0f0f0; 
    border-radius: 15px;
    overflow: hidden; 
  }

  .ingredient-base-td {
    position: absolute; 
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); 
    box-sizing: border-box;
    display: flex; 
    justify-content: center;
    align-items: center;
    opacity: 0; 
  }

  .plate-visual-top-down {
    /* Plate styles are inlined */
  }

  .bread-slice-td {
    box-shadow: inset 0 0 8px rgba(0,0,0,0.1); 
  }

  .chicken-breast-td-style {
    box-shadow: inset 0 0 5px rgba(0,0,0,0.05);
  }
  
  .lettuce-leaf-td {
     border: 1px solid darken(#7BAF3B, 15%); 
     filter: brightness(0.95) saturate(1.1);
  }

  .cheese-slice-td {
    filter: brightness(1.05);
  }

  .sauce-td {
    /* Mayo swirl style is inlined */
  }

  .bacon-strip-td {
    background-image: linear-gradient(
      90deg,
      #8C3B3B 0% 25%,  
      #C88A6B 25% 40%, 
      #8C3B3B 40% 65%, 
      #C88A6B 65% 80%,
      #8C3B3B 80% 100%
    );
    border-radius: 5px;
    border: 1px solid #6F2F2F;
    box-shadow: 0 1px 2px rgba(0,0,0,0.2);
  }

  .ingredient-text-td {
    font-size: 0.8em;
    color: rgba(0,0,0,0.65);
    font-weight: bold;
    text-shadow: 1px 1px 0px rgba(255,255,255,0.2);
    pointer-events: none;
  }
</style> 