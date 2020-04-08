import { writable } from 'svelte/store';

function createMeeting() {
  const { subscribe, set, update } = writable(null);

  return {
    subscribe,
    set,
    update,
    updateLive: (live) => {
      update((prev) => ({ ...prev, live }));
    },
    updateViewers: (viewers) => {
      update((prev) => ({ ...prev, viewers }));
    },
  };
}

function createSlides() {
  const { subscribe, set, update } = writable({
    activeSlide: 0,
    count: 0,
    slideContent: {},
  });

  const getNewIndex = (prev, index) =>
    index >= 0 && index < prev.count ? index : prev.activeSlide;

  return {
    subscribe,
    update,
    addSlideContent: (slidesData) => {
      update((prev) => ({
        ...prev,
        count: slidesData.length,
        slideContent: slidesData,
      }));
    },
    setSlide: (index) => {
      update((prev) => ({
        ...prev,
        activeSlide: getNewIndex(prev, index),
      }));
    },
    prevSlide: () => {
      update((prev) => ({
        ...prev,
        activeSlide: getNewIndex(prev, prev.activeSlide - 1),
      }));
    },
    nextSlide: () => {
      update((prev) => ({
        ...prev,
        activeSlide: getNewIndex(prev, prev.activeSlide + 1),
      }));
    },
  };
}

function createState() {
  const { subscribe, set, update } = writable({
    inputMeetingId: '',
    currentTab: 0,
    previewHTML: '',
    reactions: [
      { id: 'thumbs-up', emoji: '👍' },
      { id: 'thumbs-down', emoji: '👎' },
      { id: 'clap', emoji: '👏' },
    ],
    // loggedIn: true,
    // joined: false,
    // me: {
    //   isHost: false,
    // },
  });

  return {
    subscribe,
    switchTab: (index) => {
      update((prev) => ({ ...prev, currentTab: index }));
    },
    updatePreviewHTML: (previewHTML) => {
      update((prev) => ({ ...prev, previewHTML }));
    },
  };
}

export const isHost = writable(false);
export const meeting = createMeeting();
export const slides = createSlides();
export const state = createState();
