import { writable } from 'svelte/store';

export const isHost = writable(false);
export const meeting = writable(null);
export const slides = writable({
  activeSlide: 0,
  count: 0,
  slideContent: {},
});
export const state = writable({
  loggedIn: true,
  joined: false,
  inputMeetingId: '',
  currentTab: 0,
  previewHTML: '',
  me: {
    isHost: false,
  },
  reactions: [
    { id: 'thumbs-up', emoji: '👍' },
    { id: 'thumbs-down', emoji: '👎' },
    { id: 'clap', emoji: '👏' },
  ],
  activeSlide: 0,
  slideContent: {},
});
