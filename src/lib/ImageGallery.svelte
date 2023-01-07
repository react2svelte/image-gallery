<script lang="ts">
  import './app.css';
  import type { Position, Direction, TItem } from '$lib/types';
  import SlideWrapper from '$lib/SlideWrapper.svelte';
  import ThumbnailWrapper from '$lib/ThumbnailWrapper.svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  import { debounce } from 'throttle-debounce';
  import { getIgClass, getIgContentClass, getSlideWrapperClass } from '$lib/styling';

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
  export let onErrorImageURL: string | undefined = undefined;
  export let indexSeparator: string = '/';
  export let thumbnailPosition: Position = 'bottom';
  export let startIndex: number = 0;
  export let slideDuration: number = 450;
  export let slideInterval: number = 3000;
  export let slideOnThumbnailOver: boolean = false;
  export let swipeThreshold: number = 30;
  export let swipingTransitionDuration: number = 0;
  export let swipingThumbnailTransitionDuration: number = 0;
  /** TODO
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
  */
  export let stopPropagation: boolean = false;
  export let additionalClass: string = '';
  export let useTranslate3D: boolean = true;
  export let isRTL: boolean = false;
  export let useWindowKeyDown = true;

  // transition styles for the slides
  let hardTransition = false;
  $: defaultTransitionStyle = `transform ${slideDuration}ms ease-out`;
  let noneTransitionStyle = 'none';
  $: swipingTransitionStyle = `transform ${swipingTransitionDuration}ms ease-out`;
  $: transitionStyle = hardTransition ? noneTransitionStyle : defaultTransitionStyle;

  $: currentIndex = startIndex;
  let previousIndex = startIndex;
  let playPauseIntervalId: number | null = null;
  let isPlaying = false;
  let isFullscreen = false;
  let modalFullscreen = false;
  let isTransitioning = false;
  let currentSlideOffset = 0;
  let transitionTimer = null;
  let galleryWidth = 1000;
  let gallerySlideWrapperHeight = 1000;
  let resizeSlideWrapperObserver: ResizeObserver;
  let resizeThumbnailWrapperObserver: ResizeObserver;
  let thumbnailMouseOverTimer: number | null = null;
  let lazyLoaded: boolean[] = [];
  let imageLoaded: boolean[] = [];

  let thumbnailWrapper: ThumbnailWrapper;

  $: canSlide = items.length >= 2;
  $: canSlidePrevious = currentIndex > 0;
  $: canSlideNext = currentIndex < items.length - 1;
  $: canSlideLeft = infinite || (isRTL ? canSlideNext : canSlidePrevious);
  $: canSlideRight = infinite || (isRTL ? canSlidePrevious : canSlideNext);

  $: isThumbnailVertical = thumbnailPosition === 'left' || thumbnailPosition === 'right';

  const dispatch = createEventDispatcher();

  function slideLeft() {
    slideTo(isRTL ? 'right' : 'left');
  }

  function slideRight() {
    slideTo(isRTL ? 'left' : 'right');
  }

  function slideTo(direction: Direction) {
    const nextIndex = currentIndex + (direction === 'left' ? -1 : 1);
    slideToIndex(nextIndex);
  }

  function slideToIndex(index: number) {
    if (!isTransitioning) {
      // TODO The original code is checking whether an event is provided
      if (playPauseIntervalId) {
        // user triggered event while ImageGallery is playing, reset interval
        pause(false);
        play(false);
      }

      const slideCount = items.length - 1;
      let nextIndex = index;
      if (index < 0) {
        nextIndex = slideCount;
      } else if (index > slideCount) {
        nextIndex = 0;
      }
      if (nextIndex !== currentIndex) {
        dispatch('beforeslide', { nextIndex });
      }

      isTransitioning = nextIndex !== currentIndex;
      previousIndex = currentIndex;
      currentIndex = nextIndex;
      thumbnailWrapper.slideThumbnailBar(currentIndex);
      currentSlideOffset = 0;
      onSliding();
    }
  }

  $: onSliding = () => {
    transitionTimer = window.setTimeout(() => {
      if (isTransitioning) {
        isTransitioning = false;
        // reset swiping thumbnail after transitioning to new slide,
        // so we can resume thumbnail auto translate
        thumbnailWrapper.resetSwipingThumbnail();
        dispatch('slide', { currentIndex });
      }
    }, slideDuration + 50);
  };

  function handleKeyDown(event: KeyboardEvent) {
    // keep track of mouse vs keyboard usage for a11y
    // this.imageGallery.current.classList.remove('image-gallery-using-mouse');

    if (disableKeyDown) return;

    switch (event.code) {
      case 'ArrowLeft':
        if (canSlideLeft) {
          slideLeft();
        }
        break;
      case 'ArrowRight':
        if (canSlideRight) {
          slideRight();
        }
        break;
      case 'Escape':
        if (isFullscreen && !useBrowserFullscreen) {
          exitFullScreen();
        }
        break;
      default:
        break;
    }
  }

  $: togglePlay = () => {
    if (playPauseIntervalId) {
      pause();
    } else {
      play();
    }
  };

  $: pauseOrPlay = () => {
    if (!infinite && !canSlideRight) {
      pause();
    } else {
      slideToIndex(currentIndex + 1);
    }
  };

  $: play = (shouldCallOnPlay = true) => {
    if (!playPauseIntervalId) {
      isPlaying = true;
      playPauseIntervalId = window.setInterval(pauseOrPlay, Math.max(slideInterval, slideDuration));
      if (shouldCallOnPlay) {
        dispatch('play', { currentIndex });
      }
    }
  };

  $: pause = (shouldCallOnPause = true) => {
    if (playPauseIntervalId) {
      window.clearInterval(playPauseIntervalId);
      playPauseIntervalId = null;
      isPlaying = false;
      if (shouldCallOnPause) {
        dispatch('pause', { currentIndex });
      }
    }
  };

  $: toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullScreen();
    } else {
      fullScreen();
    }
  };

  $: fullScreen = () => {
    if (useBrowserFullscreen) {
      const imageGalleryRef = document.getElementById('imageGallery')!;
      imageGalleryRef.requestFullscreen();
    } else {
      modalFullscreen = true;
    }
    isFullscreen = true;
    dispatch('screenchange', { fullscreen: true });
  };

  $: exitFullScreen = () => {
    if (isFullscreen) {
      if (useBrowserFullscreen) {
        document.exitFullscreen();
      } else {
        modalFullscreen = false;
      }
      isFullscreen = false;
      dispatch('screenchange', { fullscreen: false });
    }
  };

  $: handleImageLoad = (customEvent: {
    detail: {
      index: number;
      event: Event;
    };
  }) => {
    const index = customEvent.detail.index;
    const event = customEvent.detail.event;
    const imageExists = imageLoaded[index];
    if (!imageExists) {
      imageLoaded[index] = true; // prevent from call again
      // image just loaded, call onImageLoad
      dispatch('imageload', { index, event });
    }
  };

  $: handleImageError = (customEvent: {
    detail: {
      index: number;
      event: ErrorEvent & { target: { src: string } };
    };
  }) => {
    const index = customEvent.detail.index;
    const event = customEvent.detail.event;
    if (onErrorImageURL && !event.target.src.includes(onErrorImageURL)) {
      event.target.src = onErrorImageURL;
    }
    dispatch('imageerror', { index, event });
  };

  $: handleScreenChange = () => {
    /*
      handles screen change events that the browser triggers e.g. esc key
    */
    const fullScreenElement = document.fullscreenElement;

    // check if screenchange element is the gallery
    const imageGalleryRef = document.getElementById('imageGallery');
    const _isFullscreen = imageGalleryRef === fullScreenElement;
    dispatch('screenchange', { fullscreen: _isFullscreen });
    if (useBrowserFullscreen) {
      isFullscreen = _isFullscreen;
    }
  };

  $: igClass = getIgClass(modalFullscreen, additionalClass);
  $: igContentClass = getIgContentClass(isFullscreen, thumbnailPosition);
  $: slideWrapperClass = getSlideWrapperClass(isRTL, thumbnailPosition);

  onMount(async () => {
    const slideWrapperRef = document.getElementById('slideWrapper')!;
    initSlideWrapperResizeObserver(slideWrapperRef);
    const thumbnailWrapperRef = document.getElementById('thumbnailWrapper')!;
    initThumbnailWrapperResizeObserver(thumbnailWrapperRef);
    if (autoPlay) {
      play();
    }
  });

  const initSlideWrapperResizeObserver = (element: HTMLElement) => {
    if (!element) {
      return;
    }
    // keeps track of gallery height changes for vertical thumbnail height
    resizeSlideWrapperObserver = new ResizeObserver(
      debounce(50, (entries: ResizeObserverEntry[]) => {
        if (!entries) return;
        entries.forEach((entry) => {
          thumbnailWrapper.handleResizeWidth(entry.contentRect.width);
          handleResize();
        });
      })
    );
    resizeSlideWrapperObserver.observe(element);
  };

  const initThumbnailWrapperResizeObserver = (element: HTMLElement) => {
    if (!element) {
      return;
    } // thumbnails are not always available
    resizeThumbnailWrapperObserver = new ResizeObserver(
      debounce(50, (entries: ResizeObserverEntry[]) => {
        if (!entries) return;
        entries.forEach((entry) => {
          thumbnailWrapper.handleResizeHeight(entry.contentRect.height);
          handleResize();
        });
      })
    );
    resizeThumbnailWrapperObserver.observe(element);
  };

  $: handleResize = () => {
    // component has been unmounted
    // TODO
    // if (!this.imageGallery) {
    //   return;
    // }

    const imageGalleryRef = document.getElementById('imageGallery');
    if (imageGalleryRef) {
      galleryWidth = imageGalleryRef.offsetWidth;
    }

    const slideWrapperRef = document.getElementById('slideWrapper');
    if (slideWrapperRef) {
      gallerySlideWrapperHeight = slideWrapperRef.offsetHeight;
    }
  };

  $: onThumbnailMouseOver = (event: { detail: number }) => {
    const index = event.detail;
    if (thumbnailMouseOverTimer) {
      window.clearTimeout(thumbnailMouseOverTimer);
      thumbnailMouseOverTimer = null;
    }
    thumbnailMouseOverTimer = window.setTimeout(() => {
      slideToIndex(index);
      pause();
    }, 300);
  };

  $: onThumbnailMouseLeave = () => {
    if (thumbnailMouseOverTimer) {
      window.clearTimeout(thumbnailMouseOverTimer);
      thumbnailMouseOverTimer = null;
      if (autoPlay) {
        play();
      }
    }
  };

  $: onLazyLoad = (event: { detail: number }) => {
    lazyLoaded[event.detail] = true;
  };
</script>

<!-- TODO: we use an id as a replacement for React's "ref" -->
<div
  class={igClass}
  aria-live="polite"
  id="imageGallery"
  on:keydown={!useWindowKeyDown ? handleKeyDown : undefined}
>
  <div class={igContentClass}>
    {#if thumbnailPosition === 'bottom' || thumbnailPosition === 'right'}
      <SlideWrapper
        {slideWrapperClass}
        {items}
        {showNav}
        {showBullets}
        {showIndex}
        {currentIndex}
        {previousIndex}
        {infinite}
        {isRTL}
        {isFullscreen}
        {showFullscreenButton}
        {isPlaying}
        {showPlayButton}
        {currentSlideOffset}
        {isTransitioning}
        {galleryWidth}
        {disableSwipe}
        {stopPropagation}
        {indexSeparator}
        {lazyLoad}
        {lazyLoaded}
        {swipeThreshold}
        {flickThreshold}
        {transitionStyle}
        {swipingTransitionStyle}
        on:slideleft={() => slideLeft()}
        on:slideright={() => slideRight()}
        on:slidejump={(event) => {
          slideToIndex(event.detail);
        }}
        on:playtoggle={togglePlay}
        on:fullscreentoggle={toggleFullscreen}
        on:lazyload={onLazyLoad}
        on:imageload={handleImageLoad}
        on:imageerror={handleImageError}
      />
    {/if}
    {#if showThumbnails}
      <ThumbnailWrapper
        bind:this={thumbnailWrapper}
        {items}
        {currentIndex}
        {useTranslate3D}
        {isRTL}
        {thumbnailPosition}
        {slideDuration}
        {disableThumbnailScroll}
        {stopPropagation}
        {swipingThumbnailTransitionDuration}
        {disableThumbnailSwipe}
        {gallerySlideWrapperHeight}
        on:slidejump={(event) => {
          slideToIndex(event.detail);
        }}
        on:thumbnailmouseover={slideOnThumbnailOver ? onThumbnailMouseOver : undefined}
        on:thumbnailmouseleave={slideOnThumbnailOver ? onThumbnailMouseLeave : undefined}
        on:imageerror={handleImageError}
      />
    {/if}
    {#if thumbnailPosition === 'top' || thumbnailPosition === 'left'}
      <SlideWrapper
        {slideWrapperClass}
        {items}
        {showNav}
        {showBullets}
        {showIndex}
        {currentIndex}
        {previousIndex}
        {infinite}
        {isRTL}
        {isFullscreen}
        {showFullscreenButton}
        {isPlaying}
        {showPlayButton}
        {currentSlideOffset}
        {isTransitioning}
        {galleryWidth}
        {disableSwipe}
        {stopPropagation}
        {indexSeparator}
        {lazyLoad}
        {lazyLoaded}
        {swipeThreshold}
        {flickThreshold}
        {transitionStyle}
        {swipingTransitionStyle}
        on:slideleft={() => slideLeft()}
        on:slideright={() => slideRight()}
        on:slidejump={(event) => {
          slideToIndex(event.detail);
        }}
        on:playtoggle={togglePlay}
        on:fullscreentoggle={toggleFullscreen}
        on:lazyload={onLazyLoad}
        on:imageload={handleImageLoad}
        on:imageerror={handleImageError}
      />
    {/if}
  </div>
</div>

<svelte:window
  on:keydown={useWindowKeyDown ? handleKeyDown : undefined}
  on:fullscreenchange={handleScreenChange}
/>
