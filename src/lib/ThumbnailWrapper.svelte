<script lang="ts">
  import type { Position, TItem } from '$lib/types';
  import Thumbnail from '$lib/Thumbnail.svelte';
  import clsx from 'clsx';
  import { createEventDispatcher } from 'svelte';

  export let items: TItem[];
  export let currentIndex: number;
  export let useTranslate3D: boolean;
  export let isRTL: boolean;
  export let thumbnailPosition: Position;
  export let thumbsTranslate: number;
  export let thumbsStyle: string;
  export let slideOnThumbnailOver: boolean;

  $: isThumbnailVertical = thumbnailPosition === 'left' || thumbnailPosition === 'right';

  $: getThumbnailStyle = () => {
    let translate;
    const verticalTranslateValue = isRTL ? thumbsTranslate * -1 : thumbsTranslate;

    if (isThumbnailVertical) {
      translate = `translate(0, ${thumbsTranslate}px)`;
      if (useTranslate3D) {
        translate = `translate3d(0, ${thumbsTranslate}px, 0)`;
      }
    } else {
      translate = `translate(${verticalTranslateValue}px, 0)`;
      if (useTranslate3D) {
        translate = `translate3d(${verticalTranslateValue}px, 0, 0)`;
      }
    }
    return `
      WebkitTransform: ${translate};
      MozTransform: ${translate};
      msTransform: ${translate};
      OTransform: ${translate};
      transform: ${translate};
      ${thumbsStyle}
    `;
  };

  function getThumbnailBarHeight() {
    // TODO
    // if (isThumbnailVertical) {
    //   const { gallerySlideWrapperHeight } = this.state;
    //   return { height: gallerySlideWrapperHeight };
    // }
    return {};
  }

  $: getIgThumbnailClass = (index) => {
    return clsx(
      'image-gallery-thumbnail',
      // thumbnailClass,
      { active: currentIndex === index }
    );
  };

  const dispatch = createEventDispatcher();
</script>

<div class="image-gallery-thumbnails" id="thumbnailWrapper" style={getThumbnailBarHeight()}>
  <nav
    class="image-gallery-thumbnails-container"
    style={getThumbnailStyle()}
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
        igThumbnailClass={getIgThumbnailClass(index)}
        {slideOnThumbnailOver}
        {item}
        on:click={() => dispatch('slidejump', index)}
      />
    {/each}
  </nav>
</div>
