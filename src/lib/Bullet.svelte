<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let igBulletClass: string;
  export let currentIndex: number;
  export let index: number;

  const dispatch = createEventDispatcher();
</script>

<button
  type="button"
  class={igBulletClass}
  on:click={(event) => dispatch('click', event)}
  aria-pressed={currentIndex === index}
  aria-label={`Go to Slide ${index + 1}`}
/>
