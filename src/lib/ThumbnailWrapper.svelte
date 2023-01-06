<script lang="ts">
  import type { Position, TItem } from '$lib/types';
  import Thumbnail from '$lib/Thumbnail.svelte';
  import clsx from 'clsx';
  import { createEventDispatcher } from 'svelte';
  import { getIgThumbnailClass, getThumbnailStyle } from '$lib/styling';

  export let items: TItem[];
  export let currentIndex: number;
  export let useTranslate3D: boolean;
  export let isRTL: boolean;
  export let thumbnailPosition: Position;
  export let thumbsTranslate: number;
  export let thumbsStyle: string;
  export let slideOnThumbnailOver: boolean;

  $: isThumbnailVertical = thumbnailPosition === 'left' || thumbnailPosition === 'right';

  $: thumbnailStyle = getThumbnailStyle(
    isRTL,
    thumbsTranslate,
    isThumbnailVertical,
    useTranslate3D,
    thumbsStyle
  );

  function getThumbnailBarHeight() {
    // TODO
    // if (isThumbnailVertical) {
    //   const { gallerySlideWrapperHeight } = this.state;
    //   return { height: gallerySlideWrapperHeight };
    // }
    return {};
  }

  $: igThumbnailClasses = items.map((_, index) => getIgThumbnailClass(index, currentIndex));

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
        igThumbnailClass={igThumbnailClasses[index]}
        {slideOnThumbnailOver}
        {item}
        on:click={() => dispatch('slidejump', index)}
      />
    {/each}
  </nav>
</div>
