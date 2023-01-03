<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import SVG from '$lib/SVG.svelte';

  export let isFullscreen: boolean;

  const dispatch = createEventDispatcher();
</script>

<button
  type="button"
  class="image-gallery-icon image-gallery-fullscreen-button"
  on:click={() => dispatch('click')}
  aria-label="Open Fullscreen"
>
  <SVG strokeWidth={2} icon={isFullscreen ? 'minimize' : 'maximize'} />
</button>
