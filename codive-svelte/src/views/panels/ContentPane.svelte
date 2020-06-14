<script>
  import { createEventDispatcher } from 'svelte';
  import { roundedPanel } from '../styles';
  import Slide from '../tabs/Slide.svelte';
  import JitsiMeet from '../tabs/JitsiMeet.svelte';

  export let user;
  export let activeSlide;
  export let slideContent;
  export let currentTab;
  export let previewHTML;
  export let isHost;
  export let live;
  export let jitsiID;
  export let count;
  export let liveSlide;

  let Playground;
  let content;
  $: content = slideContent[activeSlide];

  const tabTitles = ['Conference', 'Slides', 'Editor'];
  const dispatch = createEventDispatcher();
  const switchTab = (index) => dispatch('switchTab', { index });

  import(/* webpackChunkName: "playground" */ '../tabs/Playground.svelte').then(
    ({ default: comp }) => {
      Playground = comp;
    }
  );
</script>

<style>
  .tab-header {
    display: flex;
    /* padding: 0 16px; */
  }
  .tab-btn {
    padding: 8px 16px;
    border-radius: 4px 4px 0 0;
    font-size: 12px;
    text-transform: uppercase;
    color: rgba(0, 0, 0, 0.6);
    background-color: transparent;
    outline: none;
    border: none;
    cursor: pointer;
    transition: background-color 0.1s;
    font-family: Verdana, Geneva, Tahoma, sans-serif;
  }
  .tab-btn:disabled {
    color: rgba(0, 0, 0, 0.2);
  }
  .tab-btn:not(:disabled):not(.active):hover {
    background-color: rgba(255, 255, 255, 0.6);
  }
  .tab-btn.active {
    background-color: white;
    z-index: 1;
    /* background-color: rgba(0,0,0,0.15); */
  }
  .slide {
    /* height: 100%; */
    overflow: hidden;
    flex: 1;
    background-color: white;
    /* padding: 36px 12px; */
    padding: 12px;
    display: flex;
    flex-direction: column;
    transition: border-radius 0.2s;
  }
  .first-panel {
    border-radius: 0 16px 16px 16px;
    /* We remove padding so that the Jitsi Meet iframe takes up the full panel */
    padding: 0;
  }
</style>

<div class="tab-header">
  {#each tabTitles as title, index}
    <button
      class:tab-btn={true}
      class:active={currentTab === index}
      on:click={() => switchTab(index)}
    >
      {title}
    </button>
  {/each}
</div>

<div class={`slide ${roundedPanel}`} class:first-panel={currentTab === 0}>
  <JitsiMeet isActiveTab={currentTab === 0} {user} {jitsiID} {isHost} />
  <Slide
    isActiveTab={currentTab === 1}
    {activeSlide}
    {content}
    {isHost}
    {live}
    {count}
    {liveSlide}
    on:liveSlideChange
    on:prevSlide
    on:nextSlide
    on:goToLiveSlide
    on:setSlide
  />
  {#if Playground}
    <svelte:component
      this={Playground}
      isActiveTab={currentTab === 2}
      {user}
      {previewHTML}
      on:updateText
    />
  {/if}
</div>
