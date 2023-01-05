<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Item from '$lib/Item.svelte';
  import type { TItem } from '$lib/types';

  export let index: number;
  export let alignment: string;
  export let originalClass: string;
  export let slideStyle: string;
  export let showItem: boolean;
  export let item: TItem;
  export let isFullscreen: boolean;

  const dispatch = createEventDispatcher();

  function isEnterOrSpaceKey(event) {
    const key = parseInt(event.keyCode || event.which || 0, 10);
    const ENTER_KEY_CODE = 66;
    const SPACEBAR_KEY_CODE = 62;
    return key === ENTER_KEY_CODE || key === SPACEBAR_KEY_CODE;
  }

  function handleSlideKeyUp(event) {
    // a11y support ^_^
    if (isEnterOrSpaceKey(event)) {
      dispatch('click', event);
    }
  }
</script>

<div
  aria-label={`Go to Slide ${index + 1}`}
  tabIndex="-1"
  class={`image-gallery-slide ${alignment} ${originalClass ?? ''}`}
  style={slideStyle}
  on:click={() => dispatch('click')}
  on:keyup={handleSlideKeyUp}
  on:touchmove={() => dispatch('touchmove')}
  on:touchend={() => dispatch('touchend')}
  on:touchstart={() => dispatch('touchstart')}
  on:mouseover={() => dispatch('mouseover')}
  on:focus={() => dispatch('focus')}
  on:mouseleave={() => dispatch('mouseleave')}
  role="button"
>
  {#if showItem}
    <Item
      description={item.description}
      fullscreen={item.fullscreen}
      handleImageLoaded={() => dispatch('imageloaded')}
      {isFullscreen}
      original={item.original}
      originalAlt={item.originalAlt}
      originalHeight={item.originalHeight}
      originalWidth={item.originalWidth}
      originalTitle={item.originalTitle}
      sizes={item.sizes}
      loading={item.loading}
      srcSet={item.srcSet}
    />
  {:else}
    <div style="height: 100%" />
  {/if}
</div>
