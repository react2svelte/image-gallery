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

  function handleSlideKeyUp(event: KeyboardEvent) {
    // a11y support ^_^
    const key = event.code;
    let isEnterOrSpaceKey = key === 'Enter' || key === 'Space';
    if (isEnterOrSpaceKey) {
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
      srcset={item.srcset}
    />
  {:else}
    <div style="height: 100%" />
  {/if}
</div>
