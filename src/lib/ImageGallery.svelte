<script lang="ts">
  import '../app.scss';
  import clsx from 'clsx';
  import type { TItem } from '$lib/types';
  import SlideWrapper from '$lib/SlideWrapper.svelte';

  export let flickThreshold: number = 0.4;
  export let items: TItem[];
  export let showNav: boolean = true;
  export let autoPlay: boolean = false;
  export let lazyLoad: boolean = false;
  export let infinite: boolean = true;
  export let showIndex: boolean = false;
  export let showBullets: boolean = true;
  export let showThumbnails: boolean = true;
  export let showPlayButton: boolean = true;
  export let showFullscreenButton: boolean = true;
  export let disableThumbnailScroll: boolean = false;
  export let disableKeyDown: boolean = false;
  export let disableSwipe: boolean = false;
  export let disableThumbnailSwipe: boolean = false;
  export let useBrowserFullscreen: boolean = true;
  export let onErrorImageURL: string = '';
  export let indexSeparator: string = '/';
  export let thumbnailPosition: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
  export let startIndex: number = 0;
  export let slideDuration: number = 450;
  export let slideInterval: number = 3000;
  export let slideOnThumbnailOver: boolean = false;
  export let swipeThreshold: number = 30;
  export let swipingTransitionDuration: number = 0;
  export let swipingThumbnailTransitionDuration: number = 0;
  export let onSlide: Function = null;
  export let onBeforeSlide: Function = null;
  export let onScreenChange: Function = null;
  export let onPause: Function = null;
  export let onPlay: Function = null;
  export let onClick: Function = null;
  export let onImageLoad: Function = null;
  export let onImageError: Function = null;
  export let onTouchMove: Function = null;
  export let onTouchEnd: Function = null;
  export let onTouchStart: Function = null;
  export let onMouseOver: Function = null;
  export let onMouseLeave: Function = null;
  export let onThumbnailError: Function = null;
  export let onThumbnailClick: Function = null;
  export let stopPropagation: boolean = false;
  export let additionalClass: string = '';
  export let useTranslate3D: boolean = true;
  export let isRTL: boolean = false;
  export let useWindowKeyDown: boolean;

  let currentIndex = 1;
  let previousIndex = 1;
  let isFullscreen = false;

  let thumbsTranslate = 0;
  $: thumbsStyle = { transition: `all ${slideDuration}ms ease-out` };

  $: canSlide = items.length >= 2;
  $: canSlidePrevious = currentIndex > 0;
  $: canSlideNext = currentIndex < items.length - 1;
  $: canSlideLeft = infinite || (isRTL ? canSlideNext : canSlidePrevious);
  $: canSlideRight = infinite || (isRTL ? canSlidePrevious : canSlideNext);

  function isThumbnailVertical() {
    return thumbnailPosition === 'left' || thumbnailPosition === 'right';
  }

  function getThumbnailStyle() {
    let translate;
    const verticalTranslateValue = isRTL ? thumbsTranslate * -1 : thumbsTranslate;

    if (isThumbnailVertical()) {
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
    return {
      WebkitTransform: translate,
      MozTransform: translate,
      msTransform: translate,
      OTransform: translate,
      transform: translate,
      ...thumbsStyle
    };
  }

  function slideLeft() {
    slideTo(isRTL ? 'right' : 'left');
  }

  function slideRight() {
    slideTo(isRTL ? 'left' : 'right');
  }

  function slideTo(direction) {
    const nextIndex = currentIndex + (direction === 'left' ? -1 : 1);
    slideToIndex(nextIndex);
  }

  function slideToIndex(index) {
    const slideCount = items.length - 1;
    let nextIndex = index;
    if (index < 0) {
      nextIndex = slideCount;
    } else if (index > slideCount) {
      nextIndex = 0;
    }

    if (onBeforeSlide && nextIndex !== currentIndex) {
      onBeforeSlide(nextIndex);
    }

    console.log('New currentIndex:', nextIndex);
    previousIndex = currentIndex;
    currentIndex = nextIndex;
  }

  function handleKeyDown(event) {
    // keep track of mouse vs keyboard usage for a11y
    // this.imageGallery.current.classList.remove('image-gallery-using-mouse');

    if (disableKeyDown) return;
    const LEFT_ARROW = 37;
    const RIGHT_ARROW = 39;
    const ESC_KEY = 27;
    const key = parseInt(event.keyCode || event.which || 0, 10);

    switch (key) {
      case LEFT_ARROW:
        if (canSlideLeft) {
          slideLeft();
        }
        break;
      case RIGHT_ARROW:
        if (canSlideRight) {
          slideRight();
        }
        break;
      case ESC_KEY:
        if (isFullscreen && !useBrowserFullscreen) {
          // this.exitFullScreen();
        }
        break;
      default:
        break;
    }
  }
</script>

Current index: {currentIndex}

<div class={''} aria-live="polite">
  <div class={''}>
    <SlideWrapper
      slideWrapperClass=""
      {items}
      {showNav}
      {showBullets}
      {showIndex}
      {currentIndex}
      {previousIndex}
      {infinite}
      {isRTL}
      on:slideleft={() => slideLeft()}
      on:slideright={() => slideRight()}
      on:slidejump={(event) => {
        slideToIndex(event.detail);
      }}
    />
  </div>
</div>

<svelte:window on:keydown={handleKeyDown} />
