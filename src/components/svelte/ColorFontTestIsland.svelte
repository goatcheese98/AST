<script lang="ts">
  export let textContent: string = "Test Content";
  export let fontFamily: string = "'Quicksand', sans-serif"; // Default to secondary
  export let textColor: string = "#1a1a1a"; // Default to $color-black
  export let fontSize: string = "1rem";
</script>

<div style="font-family: {fontFamily}; color: {textColor}; font-size: {fontSize}; padding: 1rem; border: 1px solid {textColor}; margin-bottom: 1rem; border-radius: 8px;">
  <p>{textContent}</p>
  <p style="font-size: 0.8rem; opacity: 0.7;">(Font: {fontFamily}, Color: {textColor})</p>
</div> 