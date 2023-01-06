<!--
  Dispatched events:
  - thumbnailswiped
  - thumbsslideoffset
-->
<script lang="ts">
  import { swipable } from '@react2svelte/swipable/main';
  import { UP, DOWN, LEFT, RIGHT } from '@react2svelte/swipable/types';
  import type { SwipeEventData } from '@react2svelte/swipable/types';
  import { createEventDispatcher } from 'svelte';
  import clsx from 'clsx';
  import { getThumbnailPositionClassName } from './styling';
  import type { Position } from './types';

  let dispatch = createEventDispatcher();

  // props
  export let disableThumbnailSwipe: boolean;
  export let stopPropagation: boolean;
  export let isThumbnailVertical: boolean;
  export let thumbnailPosition: Position;
  export let isRTL: boolean;

  export let thumbnailsWrapperHeight: number;
  export let thumbnailsWrapperWidth: number;
  export let thumbsElementScrollHeight: number;
  export let thumbsElementScrollWidth: number;

  let swipingUpDown: boolean;
  let swipingLeftRight: boolean;

  export let thumbsSwipedTranslate: number;

  function resetSwipingDirection() {
    if (swipingUpDown) {
      // user stopped swipingUpDown, reset
      swipingUpDown = false;
    }

    if (swipingLeftRight) {
      // user stopped swipingLeftRight, reset
      swipingLeftRight = false;
    }
  }

  function handleThumbnailSwiping({ event, absX, absY, dir }: SwipeEventData) {
    if (disableThumbnailSwipe) return;
    if (isThumbnailVertical) {
      // if the initial swiping is left/right, prevent moving the thumbnail bar until swipe ends
      if ((dir === LEFT || dir === RIGHT || swipingLeftRight) && !swipingUpDown) {
        if (!swipingLeftRight) {
          swipingLeftRight = true;
        }
        return;
      }

      if ((dir === UP || dir === DOWN) && !swipingUpDown) {
        swipingUpDown = true;
      }
    } else {
      // if the initial swiping is up/down, prevent moving the thumbnail bar until swipe ends
      if ((dir === UP || dir === DOWN || swipingUpDown) && !swipingLeftRight) {
        if (!swipingUpDown) {
          swipingUpDown = true;
        }
        return;
      }

      if ((dir === LEFT || dir === RIGHT) && !swipingLeftRight) {
        swipingLeftRight = true;
      }
    }

    const emptySpaceMargin = 20; // 20px to add some margin to show empty space

    let thumbsTranslate;
    let totalSwipeableLength;
    let hasSwipedPassedEnd;
    let hasSwipedPassedStart;
    let isThumbnailBarSmallerThanContainer;

    const slideY = dir === DOWN ? absY : -absY;
    const slideX = dir === RIGHT ? absX : -absX;

    if (isThumbnailVertical) {
      thumbsTranslate = thumbsSwipedTranslate + slideY;
      totalSwipeableLength = thumbsElementScrollHeight - thumbnailsWrapperHeight + emptySpaceMargin;
      hasSwipedPassedEnd = Math.abs(thumbsTranslate) > totalSwipeableLength;
      hasSwipedPassedStart = thumbsTranslate > emptySpaceMargin;
      isThumbnailBarSmallerThanContainer = thumbsElementScrollHeight <= thumbnailsWrapperHeight;
    } else {
      thumbsTranslate = thumbsSwipedTranslate + slideX;
      totalSwipeableLength = thumbsElementScrollWidth - thumbnailsWrapperWidth + emptySpaceMargin;
      hasSwipedPassedEnd = Math.abs(thumbsTranslate) > totalSwipeableLength;
      hasSwipedPassedStart = thumbsTranslate > emptySpaceMargin;
      isThumbnailBarSmallerThanContainer = thumbsElementScrollWidth <= thumbnailsWrapperWidth;
    }

    if (isThumbnailBarSmallerThanContainer) {
      // no need to swipe a thumbnail bar smaller/shorter than its container
      return;
    }

    if ((dir === LEFT || dir === UP) && hasSwipedPassedEnd) {
      // prevent further swipeing
      return;
    }

    if ((dir === RIGHT || dir === DOWN) && hasSwipedPassedStart) {
      // prevent further swipeing
      return;
    }

    if (stopPropagation) event.stopPropagation();

    if (isThumbnailVertical) {
      dispatch('thumbsslideoffset', slideY);
    } else {
      dispatch('thumbsslideoffset', slideX);
    }
  }

  function handleOnThumbnailSwiped() {
    if (disableThumbnailSwipe) return;
    resetSwipingDirection();
    dispatch('thumbnailswiped');
  }

  let cls = clsx(
    'image-gallery-thumbnails-wrapper',
    getThumbnailPositionClassName(thumbnailPosition),
    { 'thumbnails-wrapper-rtl': !isThumbnailVertical && isRTL },
    { 'thumbnails-swipe-horizontal': !isThumbnailVertical && !disableThumbnailSwipe },
    { 'thumbnails-swipe-vertical': isThumbnailVertical && !disableThumbnailSwipe }
  );
</script>

<div
  class={cls}
  use:swipable={{ delta: 0 }}
  on:swiping={(e) => handleThumbnailSwiping(e.detail)}
  on:swiped={() => handleOnThumbnailSwiped()}
>
  <slot />
</div>
