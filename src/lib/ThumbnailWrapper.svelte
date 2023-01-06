<script lang="ts">
  import type { Position, TItem } from '$lib/types';
  import Thumbnail from '$lib/Thumbnail.svelte';
  import { createEventDispatcher } from 'svelte';
  import { getIgThumbnailClass, getThumbnailStyle, getThumbsTranslate } from '$lib/styling';

  export let items: TItem[];
  export let currentIndex: number;
  export let useTranslate3D: boolean;
  export let isRTL: boolean;
  export let thumbnailPosition: Position;

  export let slideDuration: number;
  export let slideOnThumbnailOver: boolean;
  export let disableThumbnailScroll: boolean;

  let thumbnailsWrapperWidth: number;
  let thumbnailsWrapperHeight: number;

  $: isThumbnailVertical = thumbnailPosition === 'left' || thumbnailPosition === 'right';

  let thumbsTranslate = 0;
  let thumbsSwipedTranslate = 0;
  $: thumbsStyle = `transition: all ${slideDuration}ms ease-out;`;

  $: thumbnailStyle = getThumbnailStyle(
    isRTL,
    thumbsTranslate,
    isThumbnailVertical,
    useTranslate3D,
    thumbsStyle
  );

  export function handleResizeWidth(newWidth: number) {
    thumbnailsWrapperWidth = newWidth;
    handleResize();
  }

  export function handleResizeHeight(newHeight: number) {
    thumbnailsWrapperHeight = newHeight;
    handleResize();
  }

  function handleResize() {
    // Adjust thumbnail container when thumbnail width or height is adjusted
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
  }

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

<div class="image-gallery-thumbnails" id="thumbnailWrapper" style={getThumbnailBarHeight()}>
  <nav
    class="image-gallery-thumbnails-container"
    style={getThumbnailStyle(
      isRTL,
      thumbsTranslate,
      isThumbnailVertical,
      useTranslate3D,
      thumbsStyle
    )}
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
        {item}
        on:click={() => dispatch('slidejump', index)}
        on:mouseover={() => dispatch('thumbnailmouseover', index)}
        on:mouseleave={() => dispatch('thumbnailmouseleave', index)}
        on:imageerror
      />
    {/each}
  </nav>
</div>
