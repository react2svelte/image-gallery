<script lang="ts">
  import type { TItem } from '$lib/types';
  import LeftNav from '$lib/LeftNav.svelte';
  import RightNav from '$lib/RightNav.svelte';
  import { createEventDispatcher } from 'svelte';
  import Slide from '$lib/Slide.svelte';
  import Bullet from '$lib/Bullet.svelte';
  import Fullscreen from '$lib/Fullscreen.svelte';
  import PlayPause from '$lib/PlayPause.svelte';
  import SwipeWrapper from './SwipeWrapper.svelte';
  import { getAlignmentClassName, getBulletStyle, getSlideStyle } from '$lib/styling';

  // settings
  export let slideWrapperClass: string;
  export let items: TItem[];
  export let showNav: boolean;
  export let showBullets: boolean;
  export let showIndex: boolean;
  export let previousIndex: number;
  export let currentIndex: number;
  export let isTransitioning: boolean;
  export let infinite: boolean;
  export let isRTL: boolean;
  export let isPlaying: boolean;
  export let showPlayButton: boolean;
  export let isFullscreen: boolean;
  export let showFullscreenButton: boolean;
  export let disableSwipe: boolean;
  export let stopPropagation: boolean;
  export let currentSlideOffset: number;
  export let galleryWidth: number;
  export let indexSeparator: string;
  export let lazyLoad: boolean;
  export let lazyLoaded: boolean[];
  export let swipeThreshold: number;
  export let flickThreshold: number;
  export let transitionStyle: string; // how should transitions be made? CSS, i.e. 'transform 450ms ease-out'
  export let swipingTransitionStyle: string;
  export let useTranslate3D: boolean;

  let isSwiping = false;
  $: currentTransitionStyle = isSwiping ? swipingTransitionStyle : transitionStyle;

  $: canSlide = items.length >= 2;
  $: canSlidePrevious = currentIndex > 0;
  $: canSlideNext = currentIndex < items.length - 1;
  $: canSlideLeft = infinite || (isRTL ? canSlideNext : canSlidePrevious);
  $: canSlideRight = infinite || (isRTL ? canSlidePrevious : canSlideNext);

  // the element of this wrapper, useful to observe resize changes
  let elem: HTMLElement;

  export function getElem() {
    return elem;
  }

  const dispatch = createEventDispatcher();

  $: slideIsTransitioning = (index: number) => {
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

  $: isFirstOrLastSlide = (index: number) => {
    const totalSlides = items.length - 1;
    const isLastSlide = index === totalSlides;
    const isFirstSlide = index === 0;
    return isLastSlide || isFirstSlide;
  };

  $: isSlideVisible = (index: number) => {
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

  $: alignmentClasses = items.map((_, index) =>
    getAlignmentClassName(index, currentIndex, infinite, items.length)
  );

  $: slideStyles = items.map((_, index) =>
    getSlideStyle(
      index,
      currentIndex,
      previousIndex,
      items.length,
      isRTL,
      currentSlideOffset,
      infinite,
      isSlideVisible(index),
      currentTransitionStyle,
      useTranslate3D
    )
  );

  $: bulletStyles = items.map((item, index) =>
    getBulletStyle(index, currentIndex, item.bulletClass)
  );

  $: showItems = items.map((_, index) => {
    const showItem = !lazyLoad || !!alignmentClasses[index] || lazyLoaded[index];
    if (showItem && lazyLoad && !lazyLoaded[index]) {
      dispatch('lazyload', index);
    }
    return showItem;
  });
</script>

<!-- TODO: we use an id as a replacement for React's "ref" -->
<div class={slideWrapperClass} bind:this={elem}>
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
      {isTransitioning}
      {galleryWidth}
      {disableSwipe}
      {stopPropagation}
      {isRTL}
      {swipeThreshold}
      {flickThreshold}
      on:slideoffsetchanged={(e) => {
        isSwiping = true;
        currentSlideOffset = e.detail;
      }}
      on:swipeend={() => {
        isSwiping = false;
        currentSlideOffset = 0;
      }}
      on:swipeleft={() => {
        dispatch('slideleft');
      }}
      on:swiperight={() => {
        dispatch('slideright');
      }}
    >
      <div class="image-gallery-slides">
        {#each items as item, index}
          {#if $$slots.render}
            <Slide
              {index}
              alignment={alignmentClasses[index]}
              originalClass={item.originalClass}
              slideStyle={slideStyles[index]}
              showItem={showItems[index]}
              {item}
              isFullscreen={false}
              on:imageload={(event) => dispatch('imageload', { index, event })}
              on:imageerror={(event) => dispatch('imageerror', { index, event })}
            >
              <slot slot="render" name="render" {item} />
            </Slide>
          {:else}
            <Slide
              {index}
              alignment={alignmentClasses[index]}
              originalClass={item.originalClass}
              slideStyle={slideStyles[index]}
              showItem={showItems[index]}
              {item}
              isFullscreen={false}
              on:imageload={(event) => dispatch('imageload', { index, event })}
              on:imageerror={(event) => dispatch('imageerror', { index, event })}
            />
          {/if}
        {/each}
      </div>
    </SwipeWrapper>
  {:else}
    <div class="image-gallery-slides">
      {#each items as item, index}
        {#if $$slots.render}
          <Slide
            {index}
            alignment={alignmentClasses[index]}
            originalClass={item.originalClass}
            slideStyle={slideStyles[index]}
            showItem={showItems[index]}
            {item}
            isFullscreen={false}
            on:imageload={(event) => dispatch('imageload', { index, event })}
            on:imageerror={(event) => dispatch('imageerror', { index, event })}
          >
            <slot slot="render" name="render" {item} />
          </Slide>
        {:else}
          <Slide
            {index}
            alignment={alignmentClasses[index]}
            originalClass={item.originalClass}
            slideStyle={slideStyles[index]}
            showItem={showItems[index]}
            {item}
            isFullscreen={false}
            on:imageload={(event) => dispatch('imageload', { index, event })}
            on:imageerror={(event) => dispatch('imageerror', { index, event })}
          />
        {/if}
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
        {#each items as _, index}
          <Bullet
            igBulletClass={bulletStyles[index]}
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
        {indexSeparator}
      </span>
      <span class="image-gallery-index-total">
        {items.length}
      </span>
    </div>
  {/if}
</div>
