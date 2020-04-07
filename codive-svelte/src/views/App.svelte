<script>
  import firebase from 'firebase/app';
  import { FirebaseApp, User } from 'sveltefire';

  import { isHost, meeting, slides, state } from '../stores';
  import { firebaseDB, parseMeeting, parseUser } from '../utils/firebase';
  import { fetchAllSlides } from '../utils/slides';
  import Meeting from './Meeting.svelte';
  import Modal from './Modal.svelte';
  import FirebaseUI from './FirebaseUI.svelte';

  let user = null;
  // const { joined } = $state;

  function setReaction(event) {
    const reaction = event.detail.id;
    user = {
      ...user,
      reaction: reaction !== user.reaction ? reaction : null,
    };
    firebaseDB.registerPresence($meeting.id, user);
  }

  function updateLiveSlide(event) {
    const { liveSlide, liveP } = event.detail;
    firebaseDB.updateLiveSlide($meeting.id, liveSlide, liveP);
  }

  async function startJoinMeeting(event) {
    const id = event.detail.id;
    const meetData = await firebaseDB.fetchMeeting(id);
    meeting.update((prev) => parseMeeting(prev, id, meetData));
    isHost.set($meeting.host === user.uid);
    subscribeToMeeting(id);

    console.log(user, $meeting);
    firebaseDB.registerPresence(id, user);
    fetchAllSlides($meeting.meta).then((slidesData) => {
      slides.addSlideContent(slidesData);
      slides.setSlide($meeting.live.liveSlide);
    });
  }

  function updateLive(live) {
    const isLiveSlide = $slides.activeSlide === $meeting.live.liveSlide;
    const activeSlide = isLiveSlide ? live.liveSlide : $slides.activeSlide;

    if (activeSlide !== $slides.activeSlide) {
      slides.setSlide(activeSlide);
    }
    meeting.updateLive(live);
  }

  function subscribeToMeeting(id) {
    firebaseDB.subscribeToViewers(
      id,
      (viewers) => meeting.updateViewers(Object.values(viewers)),
      () => console.warn(`WARN: meetings.viewers[${id}] does not exist!`)
    );
    firebaseDB.subscribeToLive(
      id,
      (live) => updateLive(live),
      () => console.warn(`WARN: meetings.live[${id}] does not exist!`)
    );
  }
</script>

<style>
  .container {
    display: flex;
    flex-direction: row;
    background-color: rgba(0, 0, 0, 0.05);
    /* padding: 24px 32px; */
  }
</style>

<FirebaseApp {firebase}>
  <User
    let:user={rawUser}
    persist={sessionStorage}
    on:user={(ev) => (user = ev.detail.user ? parseUser(ev.detail.user) : null)}
  >
    <div slot="signed-out">
      <FirebaseUI />
    </div>
    <div slot="default" class="container" class:isHost={$isHost}>
      {#if $meeting !== null}
        <Meeting
          isHost={$isHost}
          state={$state}
          meeting={$meeting}
          localSlides={$slides}
          user={user || parseUser(rawUser)}
          on:switchTab={(event) => state.switchTab(event.detail.index)}
          on:reaction={setReaction}
          on:liveSlideChange={updateLiveSlide}
          on:setSlide={(event) => slides.setSlide(event.detail.index)}
          on:prevSlide={slides.prevSlide}
          on:nextSlide={slides.nextSlide}
          on:goToLiveSlide={() => slides.setSlide($meeting.live.liveSlide)}
          on:updateText={(event) => state.updatePreviewHTML(event.detail.text)}
        />
      {:else}
        <Modal user={user || parseUser(rawUser)} on:submit={startJoinMeeting} />
      {/if}
    </div>
  </User>
</FirebaseApp>
