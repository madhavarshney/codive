<script>
  import { createEventDispatcher } from 'svelte';

  export let activeSlide;
  export let count;
  export let liveSlide;
  // export let isHost;

  const dispatch = createEventDispatcher();
  const prevSlide = () => dispatch('prevSlide');
  const nextSlide = () => dispatch('nextSlide');
  const goToLiveSlide = () => dispatch('goToLiveSlide');
  const setSlide = (i) => dispatch('setSlide', { index: i });

  let isLiveSlide;
  $: isLiveSlide = activeSlide === liveSlide;
</script>

<style>
  .pagination {
    display: flex;
    flex-direction: row;
    align-items: center;
    overflow: auto;
    margin-left: 8px;
    padding-bottom: 16px;
  }
  .pagination-title {
    color: grey;
    font-size: 14px;
    margin-right: 8px;
    line-height: 0;
  }
  .pagination-btns {
    white-space: nowrap;
    margin-left: 4px;
    display: inline-flex;
    align-items: center;
  }
  .pagination-btn,
  .pagination-live-btn {
    padding: 4px;
    border-radius: 2px;
    line-height: 0;
    color: rgba(0, 0, 0, 0.6);
    background-color: transparent;
    outline: none;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  .pagination-btn:disabled,
  .pagination-live-btn:disabled {
    color: rgba(0, 0, 0, 0.2);
  }
  .pagination-btn:not(:disabled):hover,
  .pagination-live-btn:not(:disabled):hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
  .pagination-btn {
    height: 24px;
    width: 24px;
    font-size: 20px;
  }
  /* .pagination-live-btn.live {
        background-color: rgba(0,0,0,0.15);
    } */
  .pagination-live-btn {
    height: 24px;
    /* width: 24px; */
    font-size: 14px;
    display: flex;
    align-items: center;
  }
  .live-btn-dot {
    width: 12px;
    height: 12px;
    margin: 2px;
    margin-right: 6px;
    border-radius: 50%;
    background-color: rgb(0, 0, 0, 0.15);
    /* TODO: fix background-color transition (not currently working) */
    transition: backround-color 1s;
  }
  .live .live-btn-dot {
    background-color: red;
  }
  .pagination-dots {
    /* TODO: find better way to handle overflow */
    min-width: 4em;
    display: inline-flex;
    flex-flow: row wrap;
    align-items: center;
  }
  .pagination-dot {
    width: 12px;
    height: 12px;
    margin: 2px;
    border-radius: 50%;
    background-color: rgb(0, 0, 0, 0.15);
    /* TODO: fix background-color transition (not currently working) */
    transition: transform 0.1s, backround-color 1s;
  }
  .pagination-dot:hover {
    background-color: grey;
    transform: scale(1.3);
    cursor: pointer;
  }
  .pagination-dot.active {
    border: 0.1px lightslategray solid;
    /* background-color: rgb(125, 255, 125); */
    background-color: rgb(0, 0, 0, 0.6);
  }
  .pagination-dot.live {
    border: 0.1px lightslategray solid;
    background-color: orangered;
  }
  .spacer {
    flex: 1;
  }
</style>

<span class="pagination">
  <span class="pagination-title">STEPS</span>
  <span class="pagination-dots">
    {#each Array(count) as _, i}
      <span
        on:click={() => setSlide(i)}
        title="Go to step {i + 1}"
        class="pagination-dot"
        class:active={activeSlide === i}
        class:live={liveSlide === i}
      />
    {/each}
  </span>
  <span class="spacer" />
  <span class="pagination-btns">
    <button
      class="pagination-btn"
      disabled={activeSlide === 0}
      on:click={prevSlide}
      title="Previous Step"
    >
      ←
    </button>
    <button
      class="pagination-btn"
      disabled={activeSlide === count - 1}
      on:click={nextSlide}
      title="Next Step"
    >
      →
    </button>
    <button
      class="pagination-live-btn"
      class:live={isLiveSlide}
      on:click={goToLiveSlide}
      title="Enable Live"
    >
      <span class="live-btn-dot" />
      LIVE
    </button>
    <!-- <input type='checkbox' disabled checked={isHost} on:change={(event) => setIsHost(event.target.value)} /> -->
    <!-- <input type='checkbox' disabled checked={isHost} /> -->
  </span>
</span>
