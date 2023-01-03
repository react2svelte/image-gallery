<script lang="ts">
  import '../app.scss';
  import clsx from 'clsx';
  import type { TItem } from '$lib/types';

  export let flickThreshold: number = 0.4;
  export let items: TItem[];
  export let showNav: boolean = true;
  export let autoPlay: boolean = false;
  export let lazyLoad: boolean = false;
  export let infinite: boolean = true;
  export let showIndex: boolean = false;
  export let showBullets: boolean = false;
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

  let thumbsTranslate = 0;
  $: thumbsStyle = { transition: `all ${slideDuration}ms ease-out` };

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
</script>
