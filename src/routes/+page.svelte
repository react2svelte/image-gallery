<script lang="ts">
  import ImageGallery from '$lib/ImageGallery.svelte';

  const PREFIX_URL = 'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/';

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

<ImageGallery items={images} />
