<script lang="ts">
  import type { Position, TItem } from '$lib/types';
  import Thumbnail from '$lib/Thumbnail.svelte';
  import { createEventDispatcher } from 'svelte';
  import { getIgThumbnailClass, getThumbnailStyle, getThumbsTranslate } from '$lib/styling';
  import ThumbnailSwipeWrapper from './ThumbnailSwipeWrapper.svelte';

  export let items: TItem[];
  export let currentIndex: number;
  export let useTranslate3D: boolean;
  export let isRTL: boolean;
  export let thumbnailPosition: Position;
  export let stopPropagation: boolean;
  export let swipingThumbnailTransitionDuration: number;

  let isSwipingThumbnail = false; // currently swiping?
  let isSwipedThumbnail = false; // swiped? relevant for auto-play

  export let slideDuration: number;
  export let slideOnThumbnailOver: boolean;
  export let disableThumbnailScroll: boolean;

  // the thumbnails container element
  let thumbnails: HTMLElement;
  let swipeWrapper: ThumbnailSwipeWrapper;

  let thumbnailsWrapperWidth: number;
  let thumbnailsWrapperHeight: number;

  let thumbsElementScrollHeight: number;
  let thumbsElementScrollWidth: number;

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

  export function resetSwipingThumbnail() {
    isSwipedThumbnail = false;
  }

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
    thumbsElementScrollWidth = thumbnails.scrollWidth;
    thumbsElementScrollHeight = thumbnails.scrollHeight;
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
    if (isSwipedThumbnail) {
      return;
    }

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

<ThumbnailSwipeWrapper
  bind:this={swipeWrapper}
  {stopPropagation}
  {isThumbnailVertical}
  {isRTL}
  {thumbnailPosition}
  {thumbnailsWrapperHeight}
  {thumbnailsWrapperWidth}
  {thumbsElementScrollHeight}
  {thumbsElementScrollWidth}
  {swipingThumbnailTransitionDuration}
  {thumbsSwipedTranslate}
  on:thumbsslideoffset={(e) => {
    isSwipingThumbnail = true;
    thumbsTranslate = thumbsSwipedTranslate + e.detail;
  }}
  on:thumbnailswiped={(e) => {
    isSwipingThumbnail = false;
    isSwipedThumbnail = true;
    thumbsSwipedTranslate = thumbsTranslate;
  }}
>
  <div class="image-gallery-thumbnails" id="thumbnailWrapper" style={getThumbnailBarHeight()}>
    <nav
      bind:this={thumbnails}
      class="image-gallery-thumbnails-container"
      style={thumbnailStyle}
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
        />
      {/each}
    </nav>
  </div>
</ThumbnailSwipeWrapper>
