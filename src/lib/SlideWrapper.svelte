<script lang="ts">
  import type { TItem } from '$lib/types';
  import LeftNav from '$lib/LeftNav.svelte';
  import RightNav from '$lib/RightNav.svelte';
  import { createEventDispatcher } from 'svelte';
  import Slide from '$lib/Slide.svelte';
  import Bullet from '$lib/Bullet.svelte';
  import clsx from 'clsx';
  import Fullscreen from '$lib/Fullscreen.svelte';
  import PlayPause from '$lib/PlayPause.svelte';
  import SwipeWrapper from './SwipeWrapper.svelte';

  export let slideWrapperClass: string;
  export let items: TItem[];
  export let showNav: boolean;
  export let showBullets: boolean;
  export let showIndex: boolean;
  export let previousIndex: number;
  export let currentIndex: number;
  export let isTransitioning;
  export let infinite: boolean;
  export let isRTL: boolean;
  export let isPlaying: boolean;
  export let showPlayButton: boolean;
  export let isFullscreen: boolean;
  export let showFullscreenButton: boolean;
  export let disableSwipe = false;
  export let disablePropagation = false;
  export let currentSlideOffset;
  export let galleryWidth;

  $: canSlide = items.length >= 2;
  $: canSlidePrevious = currentIndex > 0;
  $: canSlideNext = currentIndex < items.length - 1;
  $: canSlideLeft = infinite || (isRTL ? canSlideNext : canSlidePrevious);
  $: canSlideRight = infinite || (isRTL ? canSlidePrevious : canSlideNext);

  const dispatch = createEventDispatcher();

  $: getAlignmentClassName = (index) => {
    // Necessary for lazing loading
    let alignment = '';
    const leftClassName = 'image-gallery-left';
    const centerClassName = 'image-gallery-center';
    const rightClassName = 'image-gallery-right';

    switch (index) {
      case currentIndex - 1:
        alignment = ` ${leftClassName}`;
        break;
      case currentIndex:
        alignment = ` ${centerClassName}`;
        break;
      case currentIndex + 1:
        alignment = ` ${rightClassName}`;
        break;
      default:
        break;
    }

    if (items.length >= 3 && infinite) {
      if (index === 0 && currentIndex === items.length - 1) {
        // set first slide as right slide if were sliding right from last slide
        alignment = ` ${rightClassName}`;
      } else if (index === items.length - 1 && currentIndex === 0) {
        // set last slide as left slide if were sliding left from first slide
        alignment = ` ${leftClassName}`;
      }
    }

    return alignment;
  };

  $: slideIsTransitioning = (index) => {
    /*
    returns true if the gallery is transitioning and the index is not the
    previous or currentIndex
    */
    const indexIsNotPreviousOrNextSlide = !(index === previousIndex || index === currentIndex);
    return isTransitioning && indexIsNotPreviousOrNextSlide;
  };

  $: ignoreIsTransitioning = () => {
    /*
      Ignore isTransitioning because were not going to sibling slides
      e.g. center to left or center to right
    */
    const totalSlides = items.length - 1;

    // we want to show the in between slides transition
    const slidingMoreThanOneSlideLeftOrRight = Math.abs(previousIndex - currentIndex) > 1;
    const notGoingFromFirstToLast = !(previousIndex === 0 && currentIndex === totalSlides);
    const notGoingFromLastToFirst = !(previousIndex === totalSlides && currentIndex === 0);

    return slidingMoreThanOneSlideLeftOrRight && notGoingFromFirstToLast && notGoingFromLastToFirst;
  };

  $: isFirstOrLastSlide = (index) => {
    const totalSlides = items.length - 1;
    const isLastSlide = index === totalSlides;
    const isFirstSlide = index === 0;
    return isLastSlide || isFirstSlide;
  };

  $: isSlideVisible = (index) => {
    /*
      Show slide if slide is the current slide and the next slide
      OR
      The slide is going more than one slide left or right, but not going from
      first to last and not going from last to first

      Edge case:
      If you go to the first or last slide, when they're
      not left, or right of each other they will try to catch up in the background
      so unless were going from first to last or vice versa we don't want the first
      or last slide to show up during the transition
    */
    return !slideIsTransitioning(index) || (ignoreIsTransitioning() && !isFirstOrLastSlide(index));
  };

  $: getSlideStyle = (index) => {
    const baseTranslateX = -100 * currentIndex;
    const totalSlides = items.length - 1;

    // calculates where the other slides belong based on currentIndex
    // if it is RTL the base line should be reversed
    let translateX = (baseTranslateX + index * 100) * (isRTL ? -1 : 1) + currentSlideOffset;

    if (infinite && items.length > 2) {
      if (currentIndex === 0 && index === totalSlides) {
        // make the last slide the slide before the first
        // if it is RTL the base line should be reversed
        translateX = -100 * (isRTL ? -1 : 1) + currentSlideOffset;
      } else if (currentIndex === totalSlides && index === 0) {
        // make the first slide the slide after the last
        // if it is RTL the base line should be reversed
        translateX = 100 * (isRTL ? -1 : 1) + currentSlideOffset;
      }
    }

    // Special case when there are only 2 items with infinite on
    if (infinite && items.length === 2) {
      translateX = this.getTranslateXForTwoSlide(index);
    }

    let translate = `translate(${translateX}%, 0)`;

    // if (useTranslate3D) {
    // eslint-disable-next-line no-constant-condition
    if (true) {
      translate = `translate3d(${translateX}%, 0, 0)`;
    }

    // don't show some slides while transitioning to avoid background transitions
    const isVisible = isSlideVisible(index);

    return `
      display: ${isVisible ? 'inherit' : 'none'};
      WebkitTransform: ${translate};
      MozTransform: ${translate};
      msTransform: ${translate};
      OTransform: ${translate};
      transform: ${translate};
      transition: all 450ms ease-out 0s;
    `; // ...slideStyle;
  };

  $: getBulletStyle = (index, item) => {
    return clsx('image-gallery-bullet', item.bulletClass, { active: currentIndex === index });
  };
</script>

<!-- TODO: we use an id as a replacement for React's "ref" -->
<div class={slideWrapperClass} id="slideWrapper">
  <!-- TODO: render custom controls -->

  <!-- Slides -->
  {#if canSlide}
    {#if showNav}
      <LeftNav on:click={() => dispatch('slideleft')} disabled={!canSlideLeft} />
      <RightNav on:click={() => dispatch('slideright')} disabled={!canSlideRight} />
    {/if}
    <SwipeWrapper
      {canSlideLeft}
      {canSlideRight}
      isTransitioning={false}
      {galleryWidth}
      on:slideoffsetchanged={(e) => {
        currentSlideOffset = e.detail;
      }}
      on:swipenext={() => (currentIndex += 1)}
      on:swipeprevious={() => (currentIndex -= 1)}
    >
      <div class="image-gallery-slides">
        {#each items as item, index}
          <Slide
            {index}
            alignment={getAlignmentClassName(index)}
            originalClass={item.originalClass}
            slideStyle={getSlideStyle(index)}
            showItem={true}
            {item}
            isFullscreen={false}
          />
        {/each}
      </div>
    </SwipeWrapper>
  {:else}
    <div class="image-gallery-slides">
      {#each items as item, index}
        <Slide
          {index}
          alignment={getAlignmentClassName(index)}
          originalClass={item.originalClass}
          slideStyle={getSlideStyle(index)}
          showItem={true}
          {item}
          isFullscreen={false}
        />
      {/each}
    </div>
  {/if}

  <!-- Play/pause button -->
  {#if showPlayButton}
    <PlayPause on:click={() => dispatch('playtoggle')} {isPlaying} />
  {/if}

  <!--  Bullets -->
  {#if showBullets}
    <div class="image-gallery-bullets">
      <div class="image-gallery-bullets-container" role="navigation" aria-label="Bullet Navigation">
        {#each items as item, index}
          <Bullet
            igBulletClass={getBulletStyle(index, item)}
            {currentIndex}
            {index}
            on:click={() => dispatch('slidejump', index)}
          />
        {/each}
      </div>
    </div>
  {/if}

  <!-- Fullscreen button -->
  {#if showFullscreenButton}
    <Fullscreen on:click={() => dispatch('fullscreentoggle')} {isFullscreen} />
  {/if}

  <!-- Index -->
  {#if showIndex}
    <div class="image-gallery-index">
      <span class="image-gallery-index-current">
        {currentIndex + 1}
      </span>
      <span class="image-gallery-index-separator">
        {' / '}
      </span>
      <span class="image-gallery-index-total">
        {items.length}
      </span>
    </div>
  {/if}
</div>
