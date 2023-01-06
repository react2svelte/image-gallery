<script lang="ts">
  import '../app.scss';
  export let strokeWidth = 1;
  export let viewBox = '0 0 24 24';
  export let icon: 'left' | 'right' | 'maximize' | 'minimize' | 'play' | 'pause';
</script>

<svg
  class="image-gallery-svg"
  xmlns="http://www.w3.org/2000/svg"
  {viewBox}
  fill="none"
  stroke="currentColor"
  stroke-width={strokeWidth}
  stroke-linecap="round"
  stroke-linejoin="round"
>
  {#if icon === 'left'}
    <polyline points="15 18 9 12 15 6" />
  {:else if icon === 'right'}
    <polyline points="9 18 15 12 9 6" />
  {:else if icon === 'maximize'}
    <path
      d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
    />
  {:else if icon === 'minimize'}
    <path
      d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
    />
  {:else if icon === 'play'}
    <polygon points="5 3 19 12 5 21 5 3" />
  {:else if icon === 'pause'}
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  {/if}
</svg>
