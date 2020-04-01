import { h } from 'hyperapp'
import htm from 'htm'

import {
    SetReaction,
    SetSlide,
    PrevSlide,
    NextSlide,
    LiveSlide,
    SetIsHost,
    SwitchTab,
    CloseModal,
    StartJoinMeeting,
} from '/actions'

const html = htm.bind(h);

// -- VIEWS --
function Viewer(props) {
  const { avatar, name, reaction, emoji, isMe } = props;
  return html`
      <div class='part'>
          <div class='part-avatar'>${avatar}</div>
          <div class='part-info'>
              <span class='part-name' title=${name}>${name}</span>
              ${isMe && html`<span class='part-you'>(You)</span>`}
          </div>
          <div class='part-reaction'>
              <span title=${reaction}>${emoji}</span>
          </div>
      </div>
  `;
}

function ReactionBtn(props) {
  const { id, emoji, active } = props;
  return html`
      <span
          onclick=${[SetReaction, id]}
          class=${{
              'reaction-btn': true,
              'active': active,
          }}
          title=${id}
      >
          ${emoji}
      </span>
  `;
}

const getChecked = (event) => event.target.checked;

function Toolbar(props) {
  const { count, activeSlide, liveSlide, isHost } = props;
  const isLiveSlide = activeSlide === liveSlide;
  const dots = [];
  for (let i = 0; i < count; i++) {
      const active = activeSlide === i;
      const live = liveSlide === i;
      // TODO: check if the way the action is used is efficient
      dots.push(html`
          <span
              onclick=${[SetSlide, i]}
              title='Go to step ${i + 1}'
              class=${{
                  'pagination-dot': true,
                  'active': active,
                  'live': live,
              }}
          />
      `);
  }
  return html`
      <span class='pagination'>
          <span class='pagination-title'>STEPS</span>
          <span class='pagination-dots'>${dots}</span>
          <span class='pagination-btns'>
              <button class='pagination-btn' disabled=${activeSlide === 0} onclick=${PrevSlide} title='Previous Step'>←</button>
              <button class='pagination-btn' disabled=${activeSlide === count - 1} onclick=${NextSlide} title='Next Step'>→</button>
              <button class=${{ 'pagination-live-btn': true, 'live': isLiveSlide }} onclick=${LiveSlide} title='Enable Live'>
                  <span class='live-btn-dot' />
                  LIVE
              </button>
              <input type="checkbox" disabled checked=${isHost} onchange=${[SetIsHost, getChecked]} />
          </span>
      </span>
  `;
}

function HeaderPane(props) {
  const { event, slides, activeSlide, isHost } = props;
  const { count, liveSlide } = slides;
  return html`
      <div class='slide-header rounded-panel'>
          <span class='slide-header-title' title=${event.title}>${event.title}</span>
          <span class='spacer'></span>
          <${Toolbar} isHost=${isHost} count=${count} activeSlide=${activeSlide} liveSlide=${liveSlide} />
      </div>
  `;
}

function ContentPane(props) {
  const { activeSlide, slideContent, currentTab, previewHTML } = props;
  const content = slideContent[activeSlide];
  const tabs = [
      (visible) => html`
          <div
              key=${activeSlide}
              class=${{
                  'slide-content': true,
                  'markdown-body': true,
                  'hidden': !visible,
              }}
              innerHTML=${content}
          />
      `,
      (visible) => html`
          <div class=${{ 'hidden': !visible }} id='meet'></div>
      `,
      (visible) => html`
          <div class=${{ 'playground': true, 'hidden': !visible }}>
              <div id='editor'></div>
              <div id='preview'>
                  <iframe srcdoc='${previewHTML}'></iframe>
              </div>
          </div>
      `,
  ];
  const tabTitles = ['Slides', 'Conference', 'Editor'];
  return html`
      <div class='tab-header'>
          ${tabTitles.map((title, index) => html`
              <button
                  class=${{
                      'tab-btn': true,
                      active: currentTab === index,
                  }}
                  onClick=${[SwitchTab, index]}
              >
                  ${title}
              </button>
          `)}
      </div>
      <div class=${{'slide': true, 'rounded-panel': true, 'square-corner-panel': currentTab === 0 }}>
          ${tabs.map((view, index) => view(index === currentTab))}
      </div>
  `;
}

function findEmoji(reactions, user) {
  return user.reaction != null
      ? reactions.find((r) => r.id === user.reaction).emoji
      : '';
}

function ViewersPane(props) {
  const { me, viewers, reactions } = props;
  // ${Viewer({
  //     ...me.user,
  //     isMe: true,
  //     emoji: findEmoji(reactions, me.user),
  // })}
  return html`
      <div class='part-panel rounded-panel'>
          <h2 class='title'>Viewers</h2>
          <div class='participants'>
              ${viewers
                  .sort((a, b) => a.uid === me.user.uid ? -1 : b.uid === me.user.uid ? 1 : 0)
                  .map((person) => Viewer({
                      ...person,
                      isMe: me.user.uid === person.uid,
                      emoji: findEmoji(reactions, person),
                  }))
              }
          </div>
      </div>
  `;
}

function YouPane(props) {
  const { me, reactions } = props
  return html`
      <div class='you-panel rounded-panel'>
          <h2 class='title'>You</h2>
          <div class='reactions'>
              ${reactions.map((r) => ReactionBtn({ ...r, active: me.user.reaction === r.id }))}
          </div>
      </div>
  `;
}

const SetInputMeetingId = (state, meetingId) => ({ ...state, inputMeetingId: meetingId });
const getValue = (event) => event.target.value;

function Modal(state) {
  const { show } = state;
  return html`
      <div class=${{ 'modal': true, 'visible': show }}>
          <div class="modal-content">
              <!-- <span class="close" onclick=${CloseModal}>×</span> -->
              <h2 style=${{ 'margin-top': 0 }}>Join a Meeting</h2>
              <p>Enter the Meeting ID: </p>
              <p>
                  <input placeholder='Meeting ID' oninput=${[SetInputMeetingId, getValue]} />
                  <button onclick=${StartJoinMeeting}>JOIN</button>
              </p>
          </div>
      </div>
  `;
}

function Meeting({ state }) {
  const { meeting, me, activeSlide, slideContent, reactions, currentTab, previewHTML } = state;
  const { viewers, event, slides } = meeting;
  return html`
      <div class='panel left-panel'>
          <${HeaderPane} isHost=${me.isHost} event=${event} activeSlide=${activeSlide} slides=${slides} />
          <${ContentPane} currentTab=${currentTab} previewHTML=${previewHTML} slides=${slides} activeSlide=${activeSlide} slideContent=${slideContent} />
      </div>
      <div class='panel right-panel'>
          <${ViewersPane} me=${me} reactions=${reactions} viewers=${viewers} />
          <${YouPane} me=${me} reactions=${reactions} />
      </div>
  `;
}

function RootChild({ state }) {
  const { loggedIn, joined, meeting, me } = state;
  if (!loggedIn) { return; }
  if (joined) {
      return html`
          <${Meeting} state=${state} />
      `;
  } else {
      return html`
          <${Modal} show=${true} />
      `;
  }
}

export default function Root(state) {
  const { me } = state;
  return html`
      <div class=${{ 'container': true, 'isHost': me.isHost }}>
          <${RootChild} state=${state} />
      </div>
  `;
}
