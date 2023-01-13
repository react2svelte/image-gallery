# @react2svelte/image-gallery

[![npm version](https://img.shields.io/npm/v/@react2svelte/image-gallery.svg)](https://www.npmjs.com/package/@react2svelte/image-gallery)

**This is an image gallery for Svelte based on [react-image-gallery](https://github.com/xiaolin/react-image-gallery) v1.2.11. Many thanks to all the contributors of that package for their hard work!**

### Live Demo (try it on mobile for swipe support)

[react2svelte.github.io/image-gallery/](https://react2svelte.github.io/image-gallery/).

React image gallery is a React component for building image galleries and carousels

## Features

- [x] Mobile swipe gestures (using [@react2svelte/swipable](https://www.npmjs.com/package/@react2svelte/swipable))
- [x] Thumbnail navigation
- [x] Fullscreen support
- [x] RTL support
- [x] Responsive design
- [x] Tons of customization options (see props below)
- [x] `play`, `pause`, `slide`, `beforeslide`, `screenchange`, `imageload`, `imageerror`, `click` events

Not yet ported

- [ ] Custom rendered slides and controls
- [ ] Some events (see below)

## Getting started

Install the library

```
npm i @react2svelte/image-gallery
```

Use it in your component/page

```html
<script lang="ts">
  import ImageGallery from '@react2svelte/image-gallery';

  const images = [
    {
      original: 'https://picsum.photos/id/1018/1000/600/',
      thumbnail: 'https://picsum.photos/id/1018/250/150/'
    },
    {
      original: 'https://picsum.photos/id/1015/1000/600/',
      thumbnail: 'https://picsum.photos/id/1015/250/150/'
    },
    {
      original: 'https://picsum.photos/id/1019/1000/600/',
      thumbnail: 'https://picsum.photos/id/1019/250/150/'
    }
  ];
</script>

<ImageGallery items="{images}" />
```

### Demo

You can also have a look at the [demo page](https://react2svelte.github.io/image-gallery/) of the package. To run it locally:

```
git clone https://github.com/react2svelte/image-gallery.git
cd image-gallery
npm install
npm run dev
```

And open http://localhost:5173/

## Props

- `items`: (required) Array of objects, see example above,
  - Available Properties
    - `original` - image src url
    - `thumbnail` - image thumbnail src url
    - `fullscreen` - image for fullscreen (defaults to original)
    - `originalHeight` - image height (html5 attribute)
    - `originalWidth` - image width (html5 attribute)
    - `loading` - image loading. Either "lazy" or "eager" (html5 attribute)
    - `thumbnailHeight` - image height (html5 attribute)
    - `thumbnailWidth` - image width (html5 attribute)
    - `thumbnailLoading` - image loading. Either "lazy" or "eager" (html5 attribute)
    - `originalClass` - custom image class
    - `thumbnailClass` - custom thumbnail class
    - `renderItem` - Function for custom rendering a specific slide (see renderItem below)
    - `renderThumbInner` - Function for custom thumbnail renderer (see renderThumbInner below)
    - `originalAlt` - image alt
    - `thumbnailAlt` - thumbnail image alt
    - `originalTitle` - image title
    - `thumbnailTitle` - thumbnail image title
    - `thumbnailLabel` - label for thumbnail
    - `description` - description for image
    - `srcSet` - image srcset (html5 attribute)
    - `sizes` - image sizes (html5 attribute)
    - `bulletClass` - extra class for the bullet of the item
- `infinite`: Boolean, default `true`
  - infinite sliding
- `lazyLoad`: Boolean, default `false`
- `showNav`: Boolean, default `true`
- `showThumbnails`: Boolean, default `true`
- `thumbnailPosition`: String, default `bottom`
  - available positions: `top, right, bottom, left`
- `showFullscreenButton`: Boolean, default `true`
- `useBrowserFullscreen`: Boolean, default `true`
  - if false, fullscreen will be done via css within the browser
- `useTranslate3D`: Boolean, default `true`
  - if false, will use `translate` instead of `translate3d` css property to transition slides
- `showPlayButton`: Boolean, default `true`
- `isRTL`: Boolean, default `false`
  - if true, gallery's direction will be from right-to-left (to support right-to-left languages)
- `showBullets`: Boolean, default `false`
- `showIndex`: Boolean, default `false`
- `autoPlay`: Boolean, default `false`
- `disableThumbnailScroll`: Boolean, default `false`
  - disables the thumbnail container from adjusting
- `disableKeyDown`: Boolean, default `false`
  - disables keydown listener for keyboard shortcuts (left arrow, right arrow, esc key)
- `disableSwipe`: Boolean, default `false`
- `disableThumbnailSwipe`: Boolean, default `false`
- `onErrorImageURL`: String, default `undefined`
  - an image src pointing to your default image if an image fails to load
  - handles both slide image, and thumbnail image
- `indexSeparator`: String, default `' / '`, ignored if `showIndex` is false
- `slideDuration`: Number, default `450`
  - transition duration during image slide in milliseconds
- `swipingTransitionDuration`: Number, default `0`
  - transition duration while swiping in milliseconds
- `slideInterval`: Number, default `3000`
- `slideOnThumbnailOver`: Boolean, default `false`
- `flickThreshold`: Number (float), default `0.4`
  - Determines the max velocity of a swipe before it's considered a flick (lower = more sensitive)
- `swipeThreshold`: Number, default `30`
  - A percentage of how far the offset of the current slide is swiped to trigger a slide event.
    e.g. If the current slide is swiped less than 30% to the left or right, it will not trigger a slide event.
- `stopPropagation`: Boolean, default `false`
  - Automatically calls stopPropagation on all 'swipe' events.
- `startIndex`: Number, default `0`
- `additionalClass`: String,
  - Additional class that will be added to the root node of the component.
- `useWindowKeyDown`: Boolean, default `true`
  - If `true`, listens to keydown events on window (window.addEventListener)
  - If `false`, listens to keydown events on image gallery element (imageGalleryElement.addEventListener)

## Functions

The following functions can be accessed:

- `play()`: plays the slides
- `pause()`: pauses the slides
- `fullScreen()`: activates full screen
- `exitFullScreen()`: deactivates full screen
- `slideToIndex(index)`: slides to a specific index
- `getCurrentIndex()`: returns the current index

## Events

Already supported

- [x] `slide`: Function, `details: { currentIndex: number }`
- [x] `beforeslide`: Function, `details: { nextIndex: number }`
- [x] `screenchange`: Function, `details: { fullscreen: boolean }`
  - When fullscreen is toggled a boolean is passed to the callback
- [x] `pause`: Function, `details: { currentIndex: number }`
- [x] `play`: Function, `details: { currentIndex: number }`
- [x] `imageload`: Function, `details: { index: number, event }`
- [x] `imageerror`: Function, `details: { index: number, event }`
- [x] `click`: Function, `details: event`

Not yet supported

- [ ] `onThumbnailError`: Function, `callback(event)`
  - overrides onErrorImage
- [ ] `onThumbnailClick`: Function, `callback(event, index)`
- [ ] `onTouchMove`: Function, `callback(event) on gallery slide`
- [ ] `onTouchEnd`: Function, `callback(event) on gallery slide`
- [ ] `onTouchStart`: Function, `callback(event) on gallery slide`
- [ ] `onMouseOver`: Function, `callback(event) on gallery slide`
- [ ] `onMouseLeave`: Function, `callback(event) on gallery slide`

## Custom Controls

`react-image-gallery` supports rendering custom controls, this feature has not been ported yet.

## License

MIT
