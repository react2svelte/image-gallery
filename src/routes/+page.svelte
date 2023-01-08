<script lang="ts">
  import './+page.css';
  import ImageGallery from '$lib/ImageGallery.svelte';
  import type { Position } from '$lib/types';

  let startIndex = 0;
  // TODO Once the ImageGallery supports rendering of custom items, we can showcase videos
  //   and other custom slides
  let showIndex = false;
  let showBullets = true;
  let infinite = true;
  let showThumbnails = true;
  let showFullscreenButton = true;
  // let showGalleryFullscreenButton = true;
  let showPlayButton = true;
  // let showGalleryPlayButton = true;
  let showNav = true;
  let isRTL = false;
  let slideDuration = 450;
  let slideInterval = 2000;
  let slideOnThumbnailOver = false;
  let thumbnailPosition: Position = 'bottom';
  // let showVideo = {};
  let useWindowKeyDown = true;
  let disableSwipe = false;
  let disableThumbnailSwipe = false;

  const PREFIX_URL = 'https://raw.githubusercontent.com/react2svelte/image-gallery/main/static/';

  function _getStaticImages() {
    let images = [];
    for (let i = 2; i < 12; i++) {
      images.push({
        original: `${PREFIX_URL}${i}.jpg`,
        thumbnail: `${PREFIX_URL}${i}t.jpg`
      });
    }

    return images;
  }

  const images = _getStaticImages();
</script>

<div class="gallery-container">
  <section class="app">
    <ImageGallery
      additionalClass="app-image-gallery"
      items={images}
      {startIndex}
      {infinite}
      {showBullets}
      {showFullscreenButton}
      {showPlayButton}
      {showThumbnails}
      {showIndex}
      {showNav}
      {isRTL}
      {thumbnailPosition}
      {slideDuration}
      {slideInterval}
      {slideOnThumbnailOver}
      {useWindowKeyDown}
      {disableSwipe}
      {disableThumbnailSwipe}
    />

    <div class="app-sandbox">
      <div class="app-sandbox-content">
        <h2 class="app-header">Settings</h2>

        <li>
          <div class="app-interval-input-group">
            <span class="app-interval-label">Start index</span>
            <input class="app-interval-input" type="number" bind:value={startIndex} />
          </div>
        </li>

        <ul class="app-buttons">
          <li>
            <div class="app-interval-input-group">
              <span class="app-interval-label">Play Interval</span>
              <input class="app-interval-input" type="number" bind:value={slideInterval} />
            </div>
          </li>

          <li>
            <div class="app-interval-input-group">
              <span class="app-interval-label">Slide Duration</span>
              <input class="app-interval-input" type="number" bind:value={slideDuration} />
            </div>
          </li>

          <li>
            <div class="app-interval-input-group">
              <span class="app-interval-label">Thumbnail Bar Position</span>
              <select class="app-interval-input" bind:value={thumbnailPosition}>
                <option value="bottom">Bottom</option>
                <option value="top">Top</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
          </li>
        </ul>

        <ul class="app-checkboxes">
          <li>
            <input id="infinite" type="checkbox" bind:checked={infinite} />
            <label for="infinite">allow infinite sliding</label>
          </li>
          <li>
            <input id="show_fullscreen" type="checkbox" bind:checked={showFullscreenButton} />
            <label for="show_fullscreen">show fullscreen button</label>
          </li>
          <li>
            <input id="show_playbutton" type="checkbox" bind:checked={showPlayButton} />
            <label for="show_playbutton">show play button</label>
          </li>
          <li>
            <input id="show_bullets" type="checkbox" bind:checked={showBullets} />
            <label for="show_bullets">show bullets</label>
          </li>
          <li>
            <input id="show_thumbnails" type="checkbox" bind:checked={showThumbnails} />
            <label for="show_thumbnails">show thumbnails</label>
          </li>
          <li>
            <input id="show_navigation" type="checkbox" bind:checked={showNav} />
            <label for="show_navigation">show navigation</label>
          </li>
          <li>
            <input id="show_index" type="checkbox" bind:checked={showIndex} />
            <label for="show_index">show index</label>
          </li>
          <li>
            <input id="is_rtl" type="checkbox" bind:checked={isRTL} />
            <label for="is_rtl">is right to left</label>
          </li>
          <li>
            <input
              id="slide_on_thumbnail_hover"
              type="checkbox"
              bind:checked={slideOnThumbnailOver}
            />
            <label for="slide_on_thumbnail_hover">slide on mouse over thumbnails</label>
          </li>
          <li>
            <input id="use_window_keydown" type="checkbox" bind:checked={useWindowKeyDown} />
            <label for="use_window_keydown">use window keydown</label>
          </li>
          <li>
            <input id="disable_swipe" type="checkbox" bind:checked={disableSwipe} />
            <label for="disable_swipe">disable swipe</label>
          </li>
          <li>
            <input
              id="disable_thumbnail_swipe"
              type="checkbox"
              bind:checked={disableThumbnailSwipe}
            />
            <label for="disable_thumbnail_swipe">disable thumbnail swipe</label>
          </li>
        </ul>
      </div>
    </div>
  </section>
</div>
