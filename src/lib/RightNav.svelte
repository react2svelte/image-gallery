<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import SVG from '$lib/SVG.svelte';

  export let disabled: boolean;

  const dispatch = createEventDispatcher();
</script>

<button
  type="button"
  class="image-gallery-icon image-gallery-right-nav"
  {disabled}
  on:click={(event) => dispatch('click', event)}
  aria-label="Next Slide"
>
  <SVG icon="right" viewBox="6 0 12 24" />
</button>
