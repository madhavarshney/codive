export const configOverwrite = ({ isMod, enableAudio, enableVideo }) => ({
  // Audio / Video settings
  startWithAudioMuted: !enableAudio,
  startWithVideoMuted: !enableVideo,

  // Moderator privileges
  remoteVideoMenu: {
    disableKick: !isMod,
  },
  disableRemoteMute: !isMod,

  // Analytics / trackers
  disableThirdPartyRequests: true,
  analytics: {
    disabled: true,
  },
  doNotStoreRoom: true,

  // Unneeded features
  enableClosePage: false,
  liveStreamingEnabled: false,
  transcribingEnabled: false,
  autoCaptionOnRecord: false,
  // TODO: check if this actually does anything
  // TODO: check if some invitations (such as phone numbers) should be enabled
  disableInviteFunctions: true,
});

export const interfaceConfigOverwrite = ({ isMod }) => ({
  SHOW_JITSI_WATERMARK: false,
  SHOW_WATERMARK_FOR_GUESTS: false,
  SHOW_CHROME_EXTENSION_BANNER: false,

  // TODO: check whether the following work
  CLOSE_PAGE_GUEST_HINT: false,
  SHOW_PROMOTIONAL_CLOSE_PAGE: false,
  SHOW_POWERED_BY: false,
  INVITATION_POWERED_BY: false,

  DISABLE_VIDEO_BACKGROUND: true,
  HIDE_KICK_BUTTON_FOR_GUESTS: !isMod,

  TOOLBAR_BUTTONS: [
    // 'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
    'microphone',
    'camera',
    'desktop',
    'fullscreen',
    // 'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
    'fodeviceselection',
    'hangup',
    'profile',
    'chat',
    // 'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
    'settings',
    // 'raisehand',
    // 'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
    'videoquality',
    'filmstrip',
    // 'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
    'tileview',
    'help',
    isMod && 'mute-everyone',
    // 'e2ee', 'security'
  ],
  // SETTINGS_SECTIONS: [ 'devices', 'language', 'moderator', 'profile', 'calendar' ],
  SETTINGS_SECTIONS: [
    'devices',
    'language',
    'profile',
    isMod && 'moderator',
  ].filter((x) => x),
});
