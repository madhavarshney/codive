<script>
  import { createEventDispatcher, afterUpdate } from 'svelte';
  import Pagination from '../components/Pagination.svelte';

  export let activeSlide;
  export let isHost;
  export let slides;
  export let isActiveTab;
  export let content;
  export let count;
  export let liveSlide;

  let containerEl;

  const dispatch = createEventDispatcher();
  const itemClicked = ({ liveP, activeSlide }) =>
    dispatch('liveSlideChange', {
      liveP,
      liveSlide: activeSlide,
    });

  // TODO: move from here
  /** @type {CSSStyleSheet} */
  const sheet = (function() {
    const style = document.createElement('style');
    // TODO: check if this is still relevant - WebKit hack :(
    style.appendChild(document.createTextNode(''));
    document.head.appendChild(style);
    return style.sheet;
  })();

  afterUpdate(() => {
    if (content) {
      displaySelection({
        isLiveSlide: slides.liveSlide === activeSlide,
        activeSlide,
        liveP: slides.liveP,
      });
    }
  });

  function displaySelection(options) {
    const { isLiveSlide, activeSlide, liveP } = options;
    console.log(
      `DisplaySelection called with isHost=${isHost}, isLiveSlide=${isLiveSlide}, activeSlide=${activeSlide}, liveP=${liveP}`
    );
    if (sheet.cssRules.length > 0) {
      sheet.deleteRule(0);
      sheet.deleteRule(0);
      sheet.deleteRule(0);
    }
    if (isLiveSlide) {
      sheet.insertRule(
        `.slide-content > :nth-child(${liveP + 1}):not(ul):not(ol) {
          padding-left: 8px;
        }`,
        0
      );
      sheet.insertRule(
        `.isHost .slide-content > ul:nth-child(${liveP + 1}),
         .isHost .slide-content > ol:nth-child(${liveP + 1}) {
           padding-left: calc(2em - 4px);
         }`,
        1
      );
      sheet.insertRule(
        `.slide-content.markdown-body > :nth-child(${liveP + 1}) {
           border-left: 4px solid orangered;
         }`,
        2
      );
    }
    if (isLiveSlide) {
      const selectedChild = containerEl.children[liveP];
      // TODO: handle else
      if (selectedChild) {
        selectedChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    // TODO: only run this if isHost (but then check for isHost updates)
    Array.from(containerEl.children).forEach((child, i) => {
      if (isHost) {
        child.onclick = () => itemClicked({ liveP: i, activeSlide });
      } else {
        child.onclick = null;
      }
      // if (isLiveSlide && i === liveP) {
      //     child.classList.add('live-p');
      // } else {
      //     child.classList.remove('live-p');
      // }
    });
  }
</script>

<style>
  .hidden {
    display: none !important;
  }
  .slide-content-container {
    flex: 1;
    padding: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .slide-content {
    overflow: auto;
    flex: 1;
    /* height: 100%; */
    /* padding: 16px; */
    /* animation: 0.5s ease-in 0.2s fadeSlideIn; */
    /* animation: 0.5s cubic-bezier(.16,1,.16,1) fadeSlideIn; */
    animation: 0.4s linear fadeSlideIn;
  }
  :global(.slide-content.markdown-body .anchor) {
    display: none !important;
  }
  :global(.slide-content > *) {
    border-left-color: white;
    padding-left: 12px;
    transition: border-left-color 0.3s;
  }
  /* TODO: find better way of working around padding for lists */
  /* .slide-content .live-p:not(ul):not(ol), .slide-content > *:not(ul):not(ol):hover { */
  :global(.isHost .slide-content > *:not(ul):not(ol):hover) {
    padding-left: 8px;
  }
  :global(.isHost .slide-content > ul:hover, .isHost
      .slide-content
      > ol:hover) {
    padding-left: calc(2em - 4px);
  }
  :global(.isHost .slide-content > *:hover) {
    border-left: 4px solid lightgrey;
  }
  /* .slide-content .live-p {
    border-left: 4px solid orangered;
  } */
  /* @keyframes fadeSlideIn {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    50% {
      opacity: 0.3;
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  } */
  @keyframes fadeSlideIn {
    0% {
      opacity: 0;
      transform: translateY(10px);
    }
    50% {
      opacity: 0.7;
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }
</style>

<div class="slide-content-container" class:hidden={!isActiveTab}>
  <Pagination
    {activeSlide}
    {count}
    {liveSlide}
    {isHost}
    on:prevSlide
    on:nextSlide
    on:goToLiveSlide
    on:setSlide
  />
  <div
    key={activeSlide}
    class="slide-content markdown-body"
    bind:this={containerEl}
  >
    {@html content}
  </div>
</div>
