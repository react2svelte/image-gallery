<script lang="ts">
  export let original: string;
  export let handleImageLoaded: Function;
  export let description = '';
  export let fullscreen = '';
  export let isFullscreen = false;
  export let originalAlt = '';
  export let originalHeight = '';
  export let originalWidth = '';
  export let originalTitle = '';
  export let sizes = '';
  export let srcSet = '';
  export let loading: 'eager' | 'lazy' = 'eager';

  const itemSrc = isFullscreen ? fullscreen || original : original;
</script>

<img
  class="image-gallery-image"
  src={itemSrc}
  alt={originalAlt}
  {srcSet}
  height={originalHeight}
  width={originalWidth}
  {sizes}
  title={originalTitle}
  on:load={(event) => handleImageLoaded(event, original)}
  {loading}
/>
{#if description}
  <span class="image-gallery-description">
    {description}
  </span>
{/if}
