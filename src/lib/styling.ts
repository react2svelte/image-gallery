import type { Position } from '$lib/types';
import clsx from 'clsx';

export const getThumbnailPositionClassName = (thumbnailPosition: Position) => {
  return ` image-gallery-thumbnails-${thumbnailPosition}`;
};

export const getThumbsTranslate = (
  indexDifference: number,
  disableThumbnailScroll: boolean,
  thumbnailsWrapperWidth: number,
  thumbnailsWrapperHeight: number,
  isThumbnailVertical: boolean,
  numberItems: number
) => {
  // the scroll space that is hidden on the left & right / top & bottom
  // when the screen is not large enough to fit all thumbnails
  let hiddenScroll;
  const thumbsElement = document.getElementById('thumbnail');

  if (disableThumbnailScroll) return 0;

  if (thumbsElement) {
    // total scroll required to see the last thumbnail
    if (isThumbnailVertical) {
      if (thumbsElement.scrollHeight <= thumbnailsWrapperHeight) {
        return 0;
      }
      hiddenScroll = thumbsElement.scrollHeight - thumbnailsWrapperHeight;
    } else {
      if (thumbsElement.scrollWidth <= thumbnailsWrapperWidth || thumbnailsWrapperWidth <= 0) {
        return 0;
      }
      hiddenScroll = thumbsElement.scrollWidth - thumbnailsWrapperWidth;
    }

    // scroll-x or y required per index change
    const perIndexScroll = hiddenScroll / (numberItems - 1);
    return indexDifference * perIndexScroll;
  }
  return 0;
};

export const getIgClass = (modalFullscreen: boolean, additionalClass: string) => {
  return clsx('image-gallery', additionalClass, { 'fullscreen-modal': modalFullscreen });
};

export const getIgContentClass = (isFullscreen: boolean, thumbnailPosition: Position) => {
  return clsx('image-gallery-content', getThumbnailPositionClassName(thumbnailPosition), {
    fullscreen: isFullscreen
  });
};

export const getSlideWrapperClass = (isRTL: boolean, thumbnailPosition: Position) => {
  return clsx('image-gallery-slide-wrapper', getThumbnailPositionClassName(thumbnailPosition), {
    'image-gallery-rtl': isRTL
  });
};

export const getSlideStyle = (
  index: number,
  currentIndex: number,
  numberItems: number,
  isRTL: boolean,
  currentSlideOffset: number,
  infinite: boolean,
  isSlideVisible: boolean,
  transitionStyle: string
) => {
  const baseTranslateX = -100 * currentIndex;
  const totalSlides = numberItems - 1;

  // calculates where the other slides belong based on currentIndex
  // if it is RTL the base line should be reversed
  let translateX = (baseTranslateX + index * 100) * (isRTL ? -1 : 1) + currentSlideOffset;

  if (infinite && numberItems > 2) {
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
  if (infinite && numberItems === 2) {
    // TODO
    // translateX = this.getTranslateXForTwoSlide(index);
  }

  let translate = `translate(${translateX}%, 0)`;

  // if (useTranslate3D) {
  // eslint-disable-next-line no-constant-condition
  if (true) {
    translate = `translate3d(${translateX}%, 0, 0)`;
  }

  return `
      display: ${isSlideVisible ? 'inherit' : 'none'};
      WebkitTransform: ${translate};
      MozTransform: ${translate};
      msTransform: ${translate};
      OTransform: ${translate};
      transform: ${translate};
      transition: ${transitionStyle};
    `;
};

export const getBulletStyle = (index: number, currentIndex: number, itemBulletClass?: string) => {
  return clsx('image-gallery-bullet', itemBulletClass, { active: currentIndex === index });
};

export const getAlignmentClassName = (
  index: number,
  currentIndex: number,
  infinite: boolean,
  numberItems: number
) => {
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

  if (numberItems >= 3 && infinite) {
    if (index === 0 && currentIndex === numberItems - 1) {
      // set first slide as right slide if were sliding right from last slide
      alignment = ` ${rightClassName}`;
    } else if (index === numberItems - 1 && currentIndex === 0) {
      // set last slide as left slide if were sliding left from first slide
      alignment = ` ${leftClassName}`;
    }
  }

  return alignment;
};

export const getThumbnailStyle = (
  isRTL: boolean,
  thumbsTranslate: number,
  isThumbnailVertical: boolean,
  useTranslate3D: boolean,
  thumbsStyle: string
) => {
  let translate;
  const verticalTranslateValue = isRTL ? thumbsTranslate * -1 : thumbsTranslate;

  if (isThumbnailVertical) {
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
  return `
      WebkitTransform: ${translate};
      MozTransform: ${translate};
      msTransform: ${translate};
      OTransform: ${translate};
      transform: ${translate};
      ${thumbsStyle}
    `;
};

export const getIgThumbnailClass = (index: number, currentIndex: number) => {
  return clsx(
    'image-gallery-thumbnail',
    // thumbnailClass,
    { active: currentIndex === index }
  );
};
