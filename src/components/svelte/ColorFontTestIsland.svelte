<script>
  export let textContent = "Test Content";
  export let fontFamily = "'Quicksand', sans-serif"; // Default to secondary
  export let textColor = "#1a1a1a"; // Default to $color-black
  export let fontSize = "1rem";
</script>

<div style="font-family: {fontFamily}; color: {textColor}; font-size: {fontSize}; padding: 1rem; border: 1px solid {textColor}; margin-bottom: 1rem; border-radius: 8px;">
  <p>{textContent}</p>
  <p style="font-size: 0.8rem; opacity: 0.7;">(Font: {fontFamily}, Color: {textColor})</p>
</div> 