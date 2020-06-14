<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import {
    configOverwrite,
    interfaceConfigOverwrite,
  } from '../../utils/jitsiSettings';

  export let isActiveTab;
  export let user;
  export let jitsiID;
  export let isHost;

  let meet;
  let meetEl;

  const dispatch = createEventDispatcher();

  onMount(() => joinMeet());
  onDestroy(() => {
    meet.dispose();
    meet = null;
  });

  function joinMeet() {
    JitsiMeet(user, jitsiID);
  }

  function JitsiMeet(user, roomName) {
    const domain = 'meet.jit.si';
    // TODO: seperate moderators from hosts
    // TODO: use user-specified settings for audio and video
    const settings = {
      isMod: isHost,
      enableAudio: false,
      enableVideo: false,
    };
    const options = {
      roomName,
      width: '100%',
      height: '100%',
      parentNode: meetEl,
      configOverwrite: configOverwrite(settings),
      interfaceConfigOverwrite: interfaceConfigOverwrite(settings),
      // userInfo: {
      //     displayName: user.name,
      // },
    };
    meet = new window.JitsiMeetExternalAPI(domain, options);
    meet.addListener('videoConferenceJoined', () => {
      meet.executeCommands({
        displayName: user.name,
        // subject: [this.groupName]
      });
    });
    meet.addListener('readyToClose', () => {
      meet.dispose();
      meet = null;
    });
  }
</script>

<style>
  .hidden {
    display: none !important;
  }
  #meet {
    flex: 1;
  }
  .rejoin-container {
    padding: 28px 36px 16px;
  }
  .rejoin-container p {
    margin-top: 0;
    margin-bottom: 16px;
  }
</style>

<div bind:this={meetEl} class:hidden={!isActiveTab} id="meet">
  {#if meet === null}
    <div class="rejoin-container">
      <!-- TODO: add more controls -->
      <p>You have left the conference.</p>
      <button on:click={joinMeet}>Join</button>
    </div>
  {/if}
</div>
