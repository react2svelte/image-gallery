<script lang="ts">
  export let original: string;
  export let fullscreen: string | undefined; // img source for fullscreen
  export let handleImageLoaded: Function;
  export let description = '';
  export let isFullscreen = false;
  export let originalAlt = '';
  export let originalHeight: number | undefined;
  export let originalWidth: number | undefined;
  export let originalTitle = '';
  export let sizes = '';
  export let srcset = '';
  export let loading: 'eager' | 'lazy' = 'eager';

  const itemSrc = isFullscreen ? fullscreen || original : original;
</script>

<img
  class="image-gallery-image"
  src={itemSrc}
  alt={originalAlt}
  {srcset}
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
