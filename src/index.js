import 'babel-polyfill';

import { app } from 'hyperapp'

// App init imports
import root from '/views/app'
import {
  KickOffAuth,
} from '/actions'

import '/styles/base.css'
import '/styles/app.css'

// Initial app state
const init = {
  loggedIn: false,
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
      { id: 'clap', emoji: '👏' }
  ],
  activeSlide: 0,
  slideContent: {},
};

// Initialize the app on the #app div
app({
  init: [init, [KickOffAuth, {}]],
  view: root,
  node: document.getElementById('app'),
});

// Enable the service worker when running the build command
// if (process.env.NODE_ENV === 'production') {
//   navigator.serviceWorker.register(`${window.location.origin}/sw.js`)
// }
