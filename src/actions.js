import { firebaseAuth, firebaseDB } from './utils/firebase';

import * as monaco from 'monaco-editor/esm/vs/editor/editor.main';
import * as Firepad from 'firepad/dist/firepad';
import { absolutify } from './utils/absolutify';

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

/** @type {CSSStyleSheet} */
const sheet = (function() {
	// Create the <style> tag
	const style = document.createElement("style");

	// Add a media (and/or media query) here if you'd like!
	// style.setAttribute("media", "screen")
	// style.setAttribute("media", "only screen and (max-width : 1024px)")

	// WebKit hack :(
	style.appendChild(document.createTextNode(""));

	// Add the <style> element to the page
	document.head.appendChild(style);

	return /** @type {CSSStyleSheet} */ (style.sheet);
})();

// -- EFFECTS & SUBSCRIPTIONS --
const extractSlides = (data) => {
    let parts = data.replace(/\<h(1|2)\>/gi, '*m*v*div***<h$1>').split('*m*v*div***');
    // TODO: clean extra stuff from last part as well
    parts.shift();

    // Split by <h1> and <h2> tags
    let skipNext = false;
    parts = parts.reduce((acc, currentValue, i, array) => {
        let trimmed = currentValue.trim();
        if (skipNext) {
            if (trimmed.search(/\<\/h(1|2)\>/gi) === trimmed.length - 5) {
                acc.push(acc.pop() + currentValue + array[i + 1]);
                skipNext = true;
            } else {
                skipNext = false;
            }
        } else {
            if (trimmed.search(/\<\/h(1|2)\>/gi) === trimmed.length - 5) {
                acc.push(currentValue + array[i + 1]);
                skipNext = true;
            } else {
                acc.push(currentValue);
            }
        }
        return acc;
    }, []);

    return parts;
}

const fetchSlide = (dispatch, options) => {
    const { repo, branch, file, path } = options.metadata;
    const slideUrl = `https://api.github.com/repos/${repo}/contents/${path}/${file}?ref=${branch}`;
    const contentUrl = `https://github.com/${repo}/raw/${branch}/${path}`;
    const cachedData = localStorage.getItem('fetch' + slideUrl);

    const request = cachedData ? Promise.resolve(cachedData) : fetch(slideUrl, {
        method: 'GET',
        // cache: 'no-cache',
        headers: {
            'Accept': 'application/vnd.github.v3.html+json',
        },
    }).then(response => response.text());
    // .then(response => response.json())

    request
        .then((data) => {
            localStorage.setItem('fetch' + slideUrl, data);
            // let slideContent = atob(data.content);
            // data = md.render(slideContent);
            return dispatch(options.onresponse, { index: options.index, data: absolutify(data, contentUrl) })
        })
        .catch((err) => console.error(err));
}

const fetchAllSlides = (dispatch, options) => {
    const { repo, branch, file, path } = options.metadata;
    const slideUrl = `https://api.github.com/repos/${repo}/contents/${path}/${file}?ref=${branch}`;
    const contentUrl = `https://github.com/${repo}/raw/${branch}/${path}`;
    const cachedData = localStorage.getItem('fetch' + slideUrl);

    const request = cachedData ? Promise.resolve(cachedData) : fetch(slideUrl, {
        method: 'GET',
        // cache: 'no-cache',
        headers: {
            'Accept': 'application/vnd.github.v3.html+json',
        },
    })
        .then(response => response.text())
        // .then(response => response.json())
        .catch((err) => console.error(err));

    request
        .then((data) => {
            // TODO: fix
            if (!data) { throw new Error('data is undefined!') }
            localStorage.setItem('fetch' + slideUrl, data);
            // let slideContent = atob(data.content);
            // data = md.render(slideContent);
            const slides = extractSlides(data);
            dispatch(SetSlideCount, slides.length);
            slides.forEach((slide, i) => {
                slide = absolutify(slide, contentUrl);
                dispatch(options.onresponse, {
                    index: i,
                    data: slide,
                });
            });
        })
        .catch((err) => console.error(err));
}

const registerPresence = (dispatch, { meetingId, user }) => {
    firebaseDB.registerPresence(meetingId, user);
};

const UpdateLive = (state, { live }) => {
    const isLiveSlide = state.activeSlide === state.meeting.slides.liveSlide;
    const activeSlide = isLiveSlide ? live.liveSlide : state.activeSlide;
    return [
        {
            ...state,
            activeSlide,
            meeting: {
                ...state.meeting,
                slides: {
                    ...state.meeting.slides,
                    ...live,
                },
            },
        },
        [displaySelection, {
            isHost: state.me.isHost,
            slideIndex: activeSlide,
            isLiveSlide: activeSlide === live.liveSlide,
            liveP: live.liveP,
        }],
    ];
}
const UpdateViewers = (state, { viewers }) => [
    { ...state, meeting: { ...state.meeting, viewers } },
];

const subscribeToMeeting = (dispatch, { id }) => {
    firebaseDB.subscribeToViewers(
        id,
        (viewers) => dispatch(UpdateViewers, { viewers: Object.values(viewers) }),
        () => console.warn(`WARN: meetings.viewers[${id}] does not exist!`),
    );
    firebaseDB.subscribeToLive(
        id,
        (live) => dispatch(UpdateLive, { live }),
        () => console.warn(`WARN: meetings.live[${id}] does not exist!`),
    );
};

const parseMeeting = (prevState, id, meeting) => {
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

const fetchMeetingFromDB = (dispatch, { id }) => {
    // let calledOnce = false;
    // firebaseDB.fetchMeeting(id, (meeting) => {
    //     if (!calledOnce) {
    //         dispatch(JoinMeeting, { id, meeting });
    //         calledOnce = true;
    //     } else {
    //         dispatch(UpdateMeeting, { id, meeting });
    //     }
    // });
    firebaseDB
        .fetchMeeting(id)
        .then((meeting) => dispatch(JoinMeeting, { id, meeting }));
}

function displaySelection(dispatch, options) {
    const { isHost, isLiveSlide, slideIndex, liveP } = options;
    console.log(`DisplaySelection called with isHost=${isHost}, isLiveSlide=${isLiveSlide}, slideIndex=${slideIndex}, liveP=${liveP}`);
    if (sheet.cssRules.length > 0) {
        sheet.deleteRule(0);
        sheet.deleteRule(0);
        sheet.deleteRule(0);
    }
    if (isLiveSlide) {
        sheet.insertRule(`
            .slide-content > :nth-child(${liveP + 1}):not(ul):not(ol) {
                padding-left: 8px;
            }
        `, 0);
        sheet.insertRule(`
            .isHost .slide-content > ul:nth-child(${liveP + 1}), .isHost .slide-content > ol:nth-child(${liveP + 1}) {
                padding-left: calc(2em - 4px);
            }
        `, 1);
        sheet.insertRule(`
            .slide-content.markdown-body > :nth-child(${liveP + 1}) {
                border-left: 4px solid orangered;
            }
        `, 2);
    }
    // TODO: check reliability
    setTimeout(() => {
        const el = document.querySelector('.slide-content.markdown-body');
        if (isLiveSlide) {
            // TODO: check reliability
            el.children[liveP].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        // TODO: only run this if isHost (but then check for isHost updates)
        Array.from(/** @type {HTMLCollectionOf<HTMLElement>} */ (el.children)).forEach((child, i) => {
            if (isHost) {
                child.onclick = (el) => dispatch(ItemClicked, { el, liveP: i, slideIndex });
            } else {
                child.onclick = null;
            }
            // if (isLiveSlide && i === liveP) {
            //     child.classList.add('live-p');
            // } else {
            //     child.classList.remove('live-p');
            // }
        });
    }, 15);
}

const parseUser = (user) => {
    return {
        uid: user.uid,
        avatar: user.photoURL || user.displayName[0],
        name: user.displayName,
        email: user.email,
        reaction: user.reaction || null,
    };
}

function updateLiveSlide(dispatch, options) {
    const { meetingId, slideIndex, pIndex } = options;
    firebaseDB.updateLiveSlide(meetingId, slideIndex, pIndex);
}

// -- ACTIONS --
const ItemClicked = (state, options) => [
    {
        ...state,
        // meeting: {
        //     ...state.meeting,
        //     slides: {
        //         ...state.meeting.slides,
        //         liveSlide: options.slideIndex,
        //         liveP: options.liveP,
        //     },
        // },
    },
    [updateLiveSlide, {
        meetingId: state.meeting.id,
        slideIndex: options.slideIndex,
        pIndex: options.liveP,
    }]
    // [
    //     [displaySelection, {
    //         isHost: state.me.isHost,
    //         isLiveSlide: true,
    //         liveP: options.liveP,
    //         slideIndex: options.slideIndex,
    //     }],
    // ],
];
const AddSlideContent = (state, { index, data }) => ({
    ...state,
    slideContent: { ...state.slideContent, [index]: data },
});
const SetSlideCount = (state, count) => ({
    ...state,
    meeting: {
        ...state.meeting,
        slides: {
            ...state.meeting.slides,
            count,
        },
    },
});
export const SetIsHost = (state, isHost) => ([
    {
        ...state,
        me: {
            ...state.me,
            isHost,
        },
    },
    [displaySelection, {
        isHost,
        slideIndex: state.activeSlide,
        isLiveSlide: state.activeSlide === state.meeting.slides.liveSlide,
        liveP: state.meeting.slides.liveP,
    }],
]);
// TODO: add ` || state.activeSlide`
export const SetSlide = (state, index) => ([
    {
        ...state,
        activeSlide: (index >= 0 && index < state.meeting.slides.count)
            ? index : state.activeSlide,
    },
    [displaySelection, {
        isHost: state.me.isHost,
        slideIndex: index,
        isLiveSlide: index === state.meeting.slides.liveSlide,
        liveP: state.meeting.slides.liveP,
    }],
    // !state.slideContent[index] && state.meeting.slideMetadata[index] && [
    //     fetchSlide,
    //     { index, metadata: state.meeting.slideMetadata[index], onresponse: AddSlideContent },
    // ],
]);
export const PrevSlide = (state) => SetSlide(state, state.activeSlide - 1);
export const NextSlide = (state) => SetSlide(state, state.activeSlide + 1);
export const LiveSlide = (state) => SetSlide(state, state.meeting.slides.liveSlide);
export const SetReaction = (state, reaction) => [
    state,
    [
        registerPresence,
        {
            meetingId: state.meeting.id,
            user: {
                ...state.me.user,
                reaction: reaction !== state.me.user.reaction
                    ? reaction : null,
            },
        },
    ],
];
// const SetReaction = (state, reaction) => ({
//     ...state,
//     me: {
//         ...state.me,
//         user: {
//             ...state.me.user,
//             reaction: reaction !== state.me.user.reaction
//                 ? reaction : null,
//         },
//     },
// });
// const LoadSlides = (state, meeting) => [state, [
//     fetchAllSlides,
//     {
//         metadata: meeting.slideMetadata[0],
//         onresponse: AddSlideContent,
//     }
//     // fetchSlide,
//     // {
//     //     index: state.activeSlide,
//     //     metadata: state.meeting.slideMetadata[state.activeSlide],
//     //     onresponse: AddSlideContent,
//     // }
// ]];
const AfterAuth = (state, { auth }) => [
    {
        ...state,
        loggedIn: true,
        me: {
            ...state.me,
            user: parseUser(auth.user),
        },
    },
    // [LoadSlides, {}],
];
export const KickOffAuth = (dispatch, options) => {
    firebaseAuth.signInUI().then((auth) => {
        console.log('Signed in: ', auth);
        /** @type {HTMLElement} */
        const authContainer = document.querySelector('#firebaseui-auth-container');
        if (authContainer) {
            authContainer.style.display = 'none';
        }
        dispatch(AfterAuth, { auth });
    });
};
const UpdateEditorText = (state, { text }) => ({
    ...state,
    previewHTML: text,
});
let meet;
function JitsiMeet(user, roomName) {
    const domain = 'meet.jit.si';
    const options = {
        roomName,
        width: '100%',
        height: '100%',
        parentNode: document.querySelector('#meet'),
        configOverwrite: {
            enableClosePage: false,
            disableThirdPartyRequests: true,
            analytics: {
                disabled: true,
            },
        },
        interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_CHROME_EXTENSION_BANNER: false,

            CLOSE_PAGE_GUEST_HINT: false,
            SHOW_PROMOTIONAL_CLOSE_PAGE: false,
            // HIDE_KICK_BUTTON_FOR_GUESTS: false,
        },
        // userInfo: {
        //     displayName: user.name,
        // },
    };
    console.log((/** @type {any} */ (window).JitsiMeetExternalAPI));
    meet = new (/** @type {any} */ (window).JitsiMeetExternalAPI)(domain, options);
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
let editor;
const defaultEditorText =
`<!DOCTYPE html>
<html>
<head>
<title>Welcome</title>
</head>

<body>
Welcome to this workshop!
</body>
</html>`;
// TODO: cleanup
function Editor(dispatch, { user }) {
    /** @type {any} */ (self).MonacoEnvironment = {
        getWorkerUrl: function(moduleId, label) {
          if (label === 'json') {
            return './json.worker.js';
          }
          if (label === 'css') {
            return './css.worker.js';
          }
          if (label === 'html') {
            return './html.worker.js';
          }
          if (label === 'typescript' || label === 'javascript') {
            return './ts.worker.js';
          }
          return './editor.worker.js';
        },
    };
    editor = monaco.editor.create(document.getElementById('editor'), {
        language: 'html',
        minimap: {
            enabled: false,
        },
        // theme: 'vs-dark',
        // autoLayout: true,
    });
    // TODO: fix and move direct firebase call
    var firepadRef = firebaseDB.db.ref(`code/${user.uid}`);
    Firepad.fromMonaco(firepadRef, editor, {
        userId: user.uid,
        defaultText: defaultEditorText,
    });
    window.addEventListener('resize', debounce(() => {
        editor.layout();
    }, 500));
    editor.getModel().onDidChangeContent(debounce((event) => {
        dispatch(UpdateEditorText, { text: editor.getValue() });
    }, 500));
}

const joinJitsiMeet = (dispatch, { user, roomName }) => {
    // TODO: fix setTimeout
    setTimeout(() => {
        Editor(dispatch, { user });
        JitsiMeet(user, roomName);
        window.addEventListener('beforeunload', () => {
            if (meet) {
                meet.dispose();
            }
        });
    }, 200);
}

const JoinMeeting = (state, { id, meeting }) => {
    const parsedMeeting = parseMeeting(null, id, meeting);
    return [
        {
            ...state,
            joined: true,
            meeting: parsedMeeting,
            activeSlide: parsedMeeting.slides.liveSlide,
            me: {
                ...state.me,
                isHost: parsedMeeting.host === state.me.user.uid,
            },
        },
        // [LoadSlides(state, meeting), {}],
        [
            [
                fetchAllSlides,
                {
                    metadata: parsedMeeting.slideMetadata,
                    // metadata: meeting.slideMetadata[0],
                    onresponse: AddSlideContent,
                },
            ],
            [
                registerPresence,
                { meetingId: parsedMeeting.id, user: state.me.user },
            ],
            [
                subscribeToMeeting,
                { id: parsedMeeting.id },
            ],
            [
                joinJitsiMeet,
                { user: state.me.user, roomName: meeting.event.jitsiID },
            ],
        ],
    ];
}

export const ResizeEditor = (dispatch, i) => (i === 2) && setTimeout(() => editor.layout(), 15);
export const SwitchTab = (state, index) => [{ ...state, currentTab: index }, [ResizeEditor, index]];

// const UpdateMeeting = (state, { id, meeting }) => {
//     const parsedMeeting = parseMeeting(state, id, meeting);
//     return [
//         {
//             ...state,
//             meeting: parsedMeeting,
//             me: {
//                 ...state.me,
//                 isHost: parsedMeeting.host === state.me.user.uid,
//             },
//         },
//         [displaySelection, {
//             isHost: parsedMeeting.host === state.me.user.uid,
//             isLiveSlide: state.activeSlide === parsedMeeting.slides.liveSlide,
//             liveP: parsedMeeting.slides.liveP,
//             slideIndex: state.activeSlide,
//         }],
//     ];
// }
export const StartJoinMeeting = (state) => [
    state,
    [fetchMeetingFromDB, {
        id: state.inputMeetingId,
    }],
];
export const CloseModal = (state) => ({ ...state, joined: true });
