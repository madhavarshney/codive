<script>
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';

    export let isActiveTab;
    export let user;
    export let jitsiID;

    let meet;
    let meetEl;

    const dispatch = createEventDispatcher();

    onMount(() => {
        JitsiMeet(user, jitsiID);
    });
    onDestroy(() => {
        meet.dispose();
        meet = null;
    });

    function JitsiMeet(user, roomName) {
        const domain = 'meet.jit.si';
        const options = {
            roomName,
            width: '100%',
            height: '100%',
            parentNode: meetEl,
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
        meet = new window.JitsiMeetExternalAPI(domain, options);
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
</script>

<style>
    .hidden {
        display: none !important;
    }
    #meet {
        /* width: 100%; */
        /* height: 100%; */
        flex: 1;
        padding: 16px 24px;
    }
</style>

<div bind:this={meetEl} class:hidden={!isActiveTab} id='meet' />
