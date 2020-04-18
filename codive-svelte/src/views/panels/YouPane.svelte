<script>
  import { createEventDispatcher } from 'svelte';
  import { title, roundedPanel } from '../styles';

  export let reactions;
  export let user;

  const dispatch = createEventDispatcher();
  const setReaction = (id) => dispatch('reaction', { id });
</script>

<style>
  .you-panel {
    background-color: white;
    /* background: linear-gradient(180deg, #00E053, #51F58EA0); */
    /* margin-bottom: 24px; */
  }
  .reactions {
    display: flex;
    justify-content: space-evenly;
  }
  .reaction-btn {
    transition: background-color 0.3s;
    width: 56px;
    height: 56px;
    padding: 8px;
    border-radius: 50%;
    font-size: 32px;
    line-height: 1;
    text-align: center;
    cursor: pointer;
    outline: none;
    border: none;
  }
  .reaction-btn:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
  .reaction-btn.active {
    background-color: rgba(0, 0, 0, 0.15);
  }
</style>

<div class={`you-panel ${roundedPanel}`}>
  <h2 class={title}>You</h2>
  <div class="reactions">
    {#each reactions as r}
      <button
        on:click={() => setReaction(r.id)}
        class="reaction-btn"
        class:active={user.reaction === r.id}
        title={r.id}
      >
        {r.emoji}
      </button>
    {/each}
  </div>
</div>
