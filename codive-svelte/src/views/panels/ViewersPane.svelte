<script>
  export let viewers = [];
  export let reactions;
  export let user;

  let sortedViewers = [];
  $: sortedViewers = viewers.sort((a, b) =>
    a.uid === user.uid ? -1 : b.uid === user.uid ? 1 : 0
  );

  function findEmoji(user) {
    return user.reaction != null
      ? reactions.find((r) => r.id === user.reaction).emoji
      : '';
  }
</script>

<style>
  .part-panel {
    flex: 1;
    /* height: 100%; */
    background-color: white;
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
  }
  .title {
    text-align: center;
  }
  .participants {
    /* display: flex;
        flex-direction: column; */
    flex: 1;
    overflow: auto;
    padding: 0 24px;
  }
  .part {
    display: flex;
    flex-direction: row;
    padding: 8px;
  }
  .part-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgb(125, 255, 125);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .part-info {
    flex: 1;
    padding: 0 16px;
    display: flex;
    align-items: center;
    overflow: hidden;
    /* justify-content: center; */
  }
  .part-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .part-you {
    margin-left: 8px;
    color: rgba(0, 0, 0, 0.6);
  }
  .part-reaction {
    font-size: 24px;
    display: flex;
    align-items: center;
  }
</style>

<div class="part-panel rounded-panel">
  <h2 class="title">Viewers</h2>
  <div class="participants">
    {#each sortedViewers as viewer}
      <div class="part">
        <div class="part-avatar">{viewer.avatar}</div>
        <div class="part-info">
          <span class="part-name" title={viewer.name}>{viewer.name}</span>
          {#if user.uid === viewer.uid}
            <span class="part-you">(You)</span>
          {/if}
        </div>
        <div class="part-reaction">
          <span title={viewer.reaction}>{findEmoji(viewer)}</span>
        </div>
      </div>
    {/each}
  </div>
</div>
