<script>
  import firebase from 'firebase/app';
  import { FirebaseApp, User } from 'sveltefire';

  import { isHost, meeting, slides, state } from '../stores';
  import { firebaseDB, parseMeeting } from '../utils/firebase';
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

  function switchTab(event) {
    state.update((prev) => ({ ...prev, currentTab: event.detail.index }));
  }

  function updateLiveSlide(event) {
    const { liveSlide, liveP } = event.detail;
    firebaseDB.updateLiveSlide($meeting.id, liveSlide, liveP);
  }

  function _setSlide(index) {
    slides.update((prev) => ({
      ...prev,
      activeSlide: index >= 0 && index < prev.count ? index : prev.activeSlide,
    }));
  }

  function setSlide(event) {
    _setSlide(event.detail.index);
  }

  function prevSlide() {
    _setSlide($slides.activeSlide - 1);
  }

  function nextSlide() {
    _setSlide($slides.activeSlide + 1);
  }

  function goToLiveSlide() {
    _setSlide($meeting.slides.liveSlide);
  }

  function updateText(event) {
    state.update((prev) => ({ ...prev, previewHTML: event.detail.text }));
  }

  const parseUser = (user) => {
    return {
      uid: user.uid,
      avatar: user.photoURL || user.displayName[0],
      name: user.displayName,
      email: user.email,
      reaction: user.reaction || null,
    };
  };

  async function startJoinMeeting(event) {
    const id = event.detail.id;
    const meetData = await firebaseDB.fetchMeeting(id);
    meeting.update((prev) => parseMeeting(prev, id, meetData));
    isHost.set($meeting.host === user.uid);
    subscribeToMeeting(id);

    console.log(user, $meeting);
    firebaseDB.registerPresence(id, user);
    const data = await fetchAllSlides($meeting.slideMetadata);

    slides.update((prev) => ({
      ...prev,
      count: data.length,
      slideContent: data,
    }));
  }

  function updateViewers(viewers) {
    meeting.update((prev) => ({ ...prev, viewers }));
  }

  function updateLive(live) {
    const isLiveSlide = $slides.activeSlide === $meeting.slides.liveSlide;
    const activeSlide = isLiveSlide ? live.liveSlide : $slides.activeSlide;

    if (activeSlide !== $slides.activeSlide) {
      slides.update((prev) => ({ ...prev, activeSlide }));
    }
    meeting.update((prev) => ({ ...prev, slides: live }));
    // [displaySelection, {
    // 	isHost: $state.me.isHost,
    // 	slideIndex: activeSlide,
    // 	isLiveSlide: activeSlide === live.liveSlide,
    // 	liveP: live.liveP,
    // }],
  }

  function subscribeToMeeting(id) {
    firebaseDB.subscribeToViewers(
      id,
      (viewers) => updateViewers(Object.values(viewers)),
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
          on:switchTab={switchTab}
          on:reaction={setReaction}
          on:liveSlideChange={updateLiveSlide}
          on:prevSlide={prevSlide}
          on:nextSlide={nextSlide}
          on:goToLiveSlide={goToLiveSlide}
          on:setSlide={setSlide}
          on:updateText={updateText}
        />
      {:else}
        <Modal user={user || parseUser(rawUser)} on:submit={startJoinMeeting} />
      {/if}
    </div>
  </User>
</FirebaseApp>
