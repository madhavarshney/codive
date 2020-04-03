import firebase from 'firebase/app';
import 'firebase/auth'
import 'firebase/database'
import * as firebaseui from 'firebaseui';

import firebaseConfig from '../../../firebaseConfig.json';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// firebase.analytics();

class FirebaseAuth {
    constructor() {
        this.auth = firebase.auth();
    }
    signInUI() {
        return new Promise((resolve, reject) => {
            var ui = new firebaseui.auth.AuthUI(this.auth);
            ui.start('#firebaseui-auth-container', {
                // autoUpgradeAnonymousUsers: true,
                credentialHelper: firebaseui.auth.CredentialHelper.NONE,
                signInOptions: [
                    firebase.auth.EmailAuthProvider.PROVIDER_ID,
                    // firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID,
                ],
                callbacks: {
                    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
                      // User successfully signed in.
                      // Return type determines whether we continue the redirect automatically
                      // or whether we leave that to developer to handle.
                      resolve(authResult);
                      return false;
                    },
                    signInFailure: function(error) {
                        console.error(error);
                        // For merge conflicts, the error.code will be
                        // 'firebaseui/anonymous-upgrade-merge-conflict'.
                        if (error.code != 'firebaseui/anonymous-upgrade-merge-conflict') {
                          return Promise.resolve();
                        }
                    }
                },
            });
        });
    }
}

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
        const docs = await Promise.all([eventRef, metaRef, liveRef, viewersRef].map(async (ref) => {
            const snapshot = await ref.once('value');
            if (!snapshot.exists()) {
                console.warn('fetchMeeting - ref does not exist!');
            }
            const val = snapshot.val();
            console.log('Retreived Doc: ', ref, val);
            // console.log('Retreived Meeting: ', meeting);
            // onData(meeting);
            return val;
        }));
        const [event, meta, live, viewers] = docs;
        return { event, slideMetadata: meta, slides: live, viewers: viewers || {} };
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
        console.log(`Updating live slide: slideIndex=${slideIndex} pIndex=${pIndex}`);
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
        viewers: [
            ...(meeting.viewers ? Object.values(meeting.viewers) : []),
        ],
        slides: {
            count: (prevState && prevState.meeting.slides.count) || 0,
            ...meeting.slides,
        },
        slideMetadata: {
            ...meeting.slideMetadata,
        },
    };
};


export const firebaseDB = new FirebaseDB();
export const firebaseAuth = new FirebaseAuth();
