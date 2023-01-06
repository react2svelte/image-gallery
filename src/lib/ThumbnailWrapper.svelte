<script lang="ts">
  import type { Position, TItem } from '$lib/types';
  import Thumbnail from '$lib/Thumbnail.svelte';
  import clsx from 'clsx';
  import { createEventDispatcher } from 'svelte';
  import { getIgThumbnailClass, getThumbnailStyle, getThumbsTranslate } from '$lib/styling';
  import { debounce } from 'throttle-debounce';

  // self
  let elem: HTMLElement;

  export let items: TItem[];
  export let currentIndex: number;
  export let useTranslate3D: boolean;
  export let isRTL: boolean;
  export let thumbnailPosition: Position;
  export let thumbsTranslate: number;
  export let thumbsStyle: string;
  export let slideOnThumbnailOver: boolean;
  export let thumbnailsWrapperWidth: number;
  export let disableThumbnailScroll: boolean;

  let thumbnailsWrapperHeight = 1000;
  let thumbsSwipedTranslate: number;

  $: isThumbnailVertical = thumbnailPosition === 'left' || thumbnailPosition === 'right';

  $: thumbnailStyle = getThumbnailStyle(
    isRTL,
    thumbsTranslate,
    isThumbnailVertical,
    useTranslate3D,
    thumbsStyle
  );

  export function initResizeObserver() {
    let resizeObserver = new ResizeObserver(
      debounce(50, (entries: ResizeObserverEntry[]) => {
        if (!entries) return;
        entries.forEach((entry) => {
          thumbnailsWrapperHeight = entry.contentRect.height;
          handleResize();
        });
      })
    );
    resizeObserver.observe(elem);
  }

  function handleResize() {
    thumbsTranslate = getThumbsTranslate(
      currentIndex,
      disableThumbnailScroll,
      thumbnailsWrapperWidth,
      thumbnailsWrapperHeight,
      isThumbnailVertical,
      items.length
    );
  }

  export function slideThumbnailBar() {
    const nextTranslate = -getThumbsTranslate(
      currentIndex,
      disableThumbnailScroll,
      thumbnailsWrapperWidth,
      thumbnailsWrapperHeight,
      isThumbnailVertical,
      items.length
    );
    // if (isSwipingThumbnail) {
    //   return;
    // }

    if (currentIndex === 0) {
      thumbsTranslate = 0;
      thumbsSwipedTranslate = 0;
    } else {
      thumbsTranslate = nextTranslate;
      thumbsSwipedTranslate = nextTranslate;
    }
  };

  function getThumbnailBarHeight() {
    // TODO
    // if (isThumbnailVertical) {
    //   const { gallerySlideWrapperHeight } = this.state;
    //   return { height: gallerySlideWrapperHeight };
    // }
    return '';
  }

  $: igThumbnailClasses = items.map((_, index) => getIgThumbnailClass(index, currentIndex));

  const dispatch = createEventDispatcher();
</script>

<div class="image-gallery-thumbnails" style={getThumbnailBarHeight()} bind:this={elem}>
  <nav
    class="image-gallery-thumbnails-container"
    style={getThumbnailStyle(isRTL, thumbsTranslate, isThumbnailVertical, useTranslate3D, thumbsStyle)}
    aria-label="Thumbnail Navigation"
    id="thumbnail"
  >
    <!-- These HTML ids are used to determine the width and height of the elements from another
    component.
     TODO: we use this as a replacement for React's "ref" but there should be a better solution.
     -->
    {#each items as item, index}
      <Thumbnail
        {index}
        {currentIndex}
        igThumbnailClass={igThumbnailClasses[index]}
        {slideOnThumbnailOver}
        {item}
        on:click={() => dispatch('slidejump', index)}
      />
    {/each}
  </nav>
</div>
