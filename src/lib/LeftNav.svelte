<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import SVG from '$lib/SVG.svelte';

  export let disabled: boolean;

  const dispatch = createEventDispatcher();
</script>

<button
  type="button"
  class="image-gallery-icon image-gallery-left-nav"
  {disabled}
  on:click={(event) => dispatch('click', event)}
  aria-label="Previous Slide"
>
  <SVG icon="left" viewBox="6 0 12 24" />
</button>
