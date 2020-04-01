import { app } from 'hyperapp'

// App init imports
import view from '/views/app'

import '/styles/base.css'

// Initial app state
const init = {
  a: 1,
  b: 2
}

// Initialize the app on the #app div
app({ init, view, node: document.getElementById('app') })

// Enable the service worker when running the build command
// if (process.env.NODE_ENV === 'production') {
//   navigator.serviceWorker.register(`${window.location.origin}/sw.js`)
// }
