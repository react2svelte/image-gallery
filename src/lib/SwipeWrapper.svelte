<!--
  A component to wrap around another component that listens to all touch events.
  Raises two events:
  - slideoffsetchanged: if the user is currently doing a swipe and the offset should change
  - swipeprevious
  - swipenext

-->
<script lang="ts">
  import { swipable } from '@react2svelte/swipable';
  import type { SwipeEventData } from '@react2svelte/swipable';
  import { createEventDispatcher } from 'svelte';

  let dispatch = createEventDispatcher();

  // TODO export these in the 'swipable' library and import here
  let UP = 'Up';
  let DOWN = 'Down';
  let LEFT = 'Left';
  let RIGHT = 'Right';

  // props
  export let disableSwipe = false;
  export let stopPropagation = false;
  export let swipingTransitionDuration = 0;
  export let swipeThreshold = 30;
  export let flickThreshold = 0.4;
  // external state
  export let isRTL = false;
  export let galleryWidth: number;
  export let canSlideLeft: boolean;
  export let canSlideRight: boolean;
  export let isTransitioning: boolean;

  // state
  let swipingLeftRight: boolean;
  let swipingUpDown: boolean;

  let currentSlideOffset: number;
  $: dispatch('slideoffsetchanged', currentSlideOffset);

  function handleSwiping({ event, absX, dir }: SwipeEventData) {
    // TODO check if function does things correctly
    console.log('swiping: ', event, absX, dir);

    // if the initial swiping is up/down prevent moving the slides until swipe ends
    if ((dir === UP || dir === DOWN || swipingUpDown) && !swipingLeftRight) {
      if (!swipingUpDown) {
        swipingUpDown = true;
      }
      return;
    }

    if ((dir === LEFT || dir === RIGHT) && !swipingLeftRight) {
      swipingLeftRight = true;
    }

    if (disableSwipe) return;

    if (stopPropagation) {
      event.preventDefault();
    }

    if (!isTransitioning) {
      const side = dir === RIGHT ? 1 : -1;

      let slideOffset = (absX / galleryWidth) * 100;
      if (Math.abs(slideOffset) >= 100) {
        slideOffset = 100;
      }
      currentSlideOffset = side * slideOffset;

      /**
       * TODO
       
      const swipingTransition = {
        transition: `transform ${swipingTransitionDuration}ms ease-out`
      };

      this.setState({slideStyle: swipingTransition});
      */
    } else {
      // don't move the slide
      currentSlideOffset = 0;
    }
  }

  function sufficientSwipe() {
    return Math.abs(currentSlideOffset) > swipeThreshold;
  }

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

  function handleSwiped({ event, dir, velocity }: SwipeEventData) {
    if (disableSwipe) return;

    if (stopPropagation) event.stopPropagation();
    resetSwipingDirection();

    currentSlideOffset = 0;

    // if it is RTL the direction is reversed
    const swipeDirection = (dir === LEFT ? 1 : -1) * (isRTL ? -1 : 1);
    const isSwipeUpOrDown = dir === UP || dir === DOWN;
    const isLeftRightFlick = velocity > flickThreshold && !isSwipeUpOrDown;
    handleOnSwipedTo(swipeDirection, isLeftRightFlick);
  }

  function handleOnSwipedTo(swipeDirection: number, isLeftRightFlick: boolean) {
    let indexOffset = 0;

    if ((sufficientSwipe() || isLeftRightFlick) && !isTransitioning) {
      // slideto the next/prev slide
      indexOffset += swipeDirection;
    }

    // If we can't swipe left or right, stay in the current index (noop)
    if ((swipeDirection === -1 && !canSlideLeft) || (swipeDirection === 1 && !canSlideRight)) {
      indexOffset = 0;
    }
    if (indexOffset < 0) {
      dispatch('swipeprevious');
    } else if (indexOffset > 0) {
      dispatch('swipenext');
    }
  }
</script>

<div
  class="image-gallery-swipe"
  use:swipable={{ delta: 0 }}
  on:swiping={(e) => handleSwiping(e.detail)}
  on:swiped={(e) => handleSwiped(e.detail)}
>
  <slot />
</div>
