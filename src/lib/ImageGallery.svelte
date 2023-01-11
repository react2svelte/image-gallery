<script lang="ts">
  import './app.css';
  import type { Position, Direction, TItem, MouseOrKeyboard } from '$lib/types';
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

  let currentIndex = 0;
  $: {
    // this bit is quite ugly.
    // we set 'hardTransition' and then do the update a little bit later,
    // to allow for the updated CSS property to propagate
    hardTransition = true;
    currentIndex = startIndex;
    setTimeout(() => {
      hardTransition = false;
    }, 50);
  }
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

  /** keep track of mouse vs keyboard usage for a11y */
  let currentlyUsingMouseOrKeyboard: MouseOrKeyboard = 'mouse';

  $: canSlidePrevious = currentIndex > 0;
  $: canSlideNext = currentIndex < items.length - 1;
  $: canSlideLeft = infinite || (isRTL ? canSlideNext : canSlidePrevious);
  $: canSlideRight = infinite || (isRTL ? canSlidePrevious : canSlideNext);

  // component bindings. These vars are set from bindings in the HTML below
  let imageGallery: HTMLElement;
  let slideWrapper: SlideWrapper;
  let thumbnailWrapper: ThumbnailWrapper;

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

  export function slideToIndex(index: number) {
    if (!isTransitioning) {
      // TODO The original code is checking whether an event is provided
      if (playPauseIntervalId) {
        // user triggered event while ImageGallery is playing, reset interval
        _pause(false);
        _play(false);
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

  export function play() {
    _play();
  }

  export function pause() {
    _pause();
  }

  export function fullScreen() {
    _fullScreen();
  }

  export function exitFullScreen() {
    _exitFullScreen();
  }

  export function getCurrentIndex() {
    return currentIndex;
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
    currentlyUsingMouseOrKeyboard = 'keyboard';

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
          _exitFullScreen();
        }
        break;
      default:
        break;
    }
  }

  function handleMouseDown() {
    currentlyUsingMouseOrKeyboard = 'mouse';
  }

  $: togglePlay = () => {
    if (playPauseIntervalId) {
      _pause();
    } else {
      _play();
    }
  };

  $: pauseOrPlay = () => {
    if (!infinite && !canSlideRight) {
      _pause();
    } else {
      slideToIndex(currentIndex + 1);
    }
  };

  $: _play = (shouldCallOnPlay = true) => {
    if (!playPauseIntervalId) {
      isPlaying = true;
      playPauseIntervalId = window.setInterval(pauseOrPlay, Math.max(slideInterval, slideDuration));
      if (shouldCallOnPlay) {
        dispatch('play', { currentIndex });
      }
    }
  };

  $: _pause = (shouldCallOnPause = true) => {
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
      _exitFullScreen();
    } else {
      _fullScreen();
    }
  };

  $: _fullScreen = () => {
    if (useBrowserFullscreen) {
      imageGallery.requestFullscreen();
    } else {
      modalFullscreen = true;
    }
    isFullscreen = true;
    dispatch('screenchange', { fullscreen: true });
  };

  $: _exitFullScreen = () => {
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
    const _isFullscreen = imageGallery === fullScreenElement;
    dispatch('screenchange', { fullscreen: _isFullscreen });
    if (useBrowserFullscreen) {
      isFullscreen = _isFullscreen;
    }
  };

  $: igClass = getIgClass(modalFullscreen, additionalClass, currentlyUsingMouseOrKeyboard);
  $: igContentClass = getIgContentClass(isFullscreen, thumbnailPosition);
  $: slideWrapperClass = getSlideWrapperClass(isRTL, thumbnailPosition);

  onMount(async () => {
    initSlideWrapperResizeObserver();
    initThumbnailWrapperResizeObserver();
    if (autoPlay) {
      _play();
    }
  });

  function initSlideWrapperResizeObserver() {
    if (!slideWrapper) {
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
    resizeSlideWrapperObserver.observe(slideWrapper.getElem());
  }

  function initThumbnailWrapperResizeObserver() {
    if (!thumbnailWrapper) {
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
    resizeThumbnailWrapperObserver.observe(thumbnailWrapper.getElem());
  }

  $: handleResize = () => {
    // component has been unmounted
    // TODO
    // if (!this.imageGallery) {
    //   return;
    // }

    if (imageGallery) {
      galleryWidth = imageGallery.offsetWidth;
    }

    const slideWrapperDiv = slideWrapper.getElem();
    if (slideWrapperDiv) {
      gallerySlideWrapperHeight = slideWrapperDiv.offsetHeight;
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
      _pause();
    }, 300);
  };

  $: onThumbnailMouseLeave = () => {
    if (thumbnailMouseOverTimer) {
      window.clearTimeout(thumbnailMouseOverTimer);
      thumbnailMouseOverTimer = null;
      if (autoPlay) {
        _play();
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
  bind:this={imageGallery}
  on:keydown={!useWindowKeyDown ? handleKeyDown : undefined}
  on:mousedown={handleMouseDown}
>
  <div class={igContentClass}>
    {#if thumbnailPosition === 'bottom' || thumbnailPosition === 'right'}
      <SlideWrapper
        bind:this={slideWrapper}
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
        {useTranslate3D}
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
        on:click
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
        bind:this={slideWrapper}
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
        {useTranslate3D}
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
        on:click
      />
    {/if}
  </div>
</div>

<svelte:window
  on:keydown={useWindowKeyDown ? handleKeyDown : undefined}
  on:fullscreenchange={handleScreenChange}
/>
