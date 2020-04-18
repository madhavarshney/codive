import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

// NOTE: this gets replaced by webpack
const firebaseConfig = process.env.FIREBASE_CONFIG;

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// firebase.analytics();

class FirebaseDB {
  constructor() {
    // this.firestore = firebase.firestore();
    this.db = firebase.database();
  }
  // fetchMeeting(id, onData, onError) {
  //     const ref = this.db.ref('meetings/' + id);
  //     ref.on('value', (snapshot) => {
  //         if (!snapshot.exists()) {
  //             onFailiure();
  //         }
  //         const meeting = snapshot.val();
  //         console.log('Retreived Meeting: ', meeting);
  //         onData(meeting);
  //     });
  // }
  async fetchMeeting(id) {
    // const ref = this.db.ref('meetings/' + id);
    const eventRef = this.db.ref(`meetings/events/${id}`);
    const metaRef = this.db.ref(`meetings/meta/${id}`);
    const liveRef = this.db.ref(`meetings/live/${id}`);
    const viewersRef = this.db.ref(`meetings/viewers/${id}`);
    const docs = await Promise.all(
      [eventRef, metaRef, liveRef, viewersRef].map(async (ref) => {
        const snapshot = await ref.once('value');
        if (!snapshot.exists()) {
          console.warn('fetchMeeting - ref does not exist!');
        }
        const val = snapshot.val();
        console.log('Retreived Doc: ', ref, val);
        // console.log('Retreived Meeting: ', meeting);
        // onData(meeting);
        return val;
      })
    );
    const [event, meta, live, viewers] = docs;
    return { event, meta, live, viewers: viewers || {} };
  }
  subscribeToViewers(id, onData, onError) {
    const ref = this.db.ref(`meetings/viewers/${id}`);
    ref.on('value', (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        onError();
      } else {
        console.log('Retreived Viewers: ', data);
        onData(data);
      }
    });
  }
  subscribeToLive(id, onData, onError) {
    const ref = this.db.ref(`meetings/live/${id}`);
    ref.on('value', (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        onError();
      } else {
        console.log('Retreived Live: ', data);
        onData(data);
      }
    });
  }
  registerPresence(meetingId, user) {
    console.log('Registering Presence for User: ', user);
    // const ref = this.db.ref(`meetings/${meetingId}/viewers`);
    const ref = this.db.ref(`meetings/viewers/${meetingId}`);
    ref.update({
      [user.uid]: user,
    });
    ref.onDisconnect().update({ [user.uid]: null });
  }
  updateLiveSlide(meetingId, slideIndex, pIndex) {
    console.log(
      `Updating live slide: slideIndex=${slideIndex} pIndex=${pIndex}`
    );
    // const ref = this.db.ref('meetings/' + meetingId + '/slides');
    const ref = this.db.ref(`meetings/live/${meetingId}`);
    ref.update({
      liveSlide: slideIndex,
      liveP: pIndex,
    });
  }
}

export const parseMeeting = (prevState, id, meeting) => {
  return {
    id,
    host: meeting.event.host,
    event: {
      ...meeting.event,
    },
    viewers: [...(meeting.viewers ? Object.values(meeting.viewers) : [])],
    live: {
      ...meeting.live,
    },
    meta: {
      ...meeting.meta,
    },
  };
};

export const parseUser = (user) => {
  return {
    uid: user.uid,
    avatar: user.photoURL || user.displayName[0],
    name: user.displayName,
    email: user.email,
    reaction: user.reaction || null,
  };
};

export const firebaseDB = new FirebaseDB();
