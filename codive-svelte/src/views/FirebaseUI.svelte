<script>
  import { onMount, getContext } from 'svelte';
  import * as firebaseui from 'firebaseui';

  let UI;

  onMount(() => {
    const firebase = getContext('firebase');

    UI = new firebaseui.auth.AuthUI(firebase.auth());
    UI.start('#firebaseui-auth-container', {
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
          // resolve(authResult);
          return false;
        },
        // TODO: implement properly;
        signInFailure: function(error) {
          console.error(error);
          // For merge conflicts, the error.code will be
          // 'firebaseui/anonymous-upgrade-merge-conflict'.
          if (error.code != 'firebaseui/anonymous-upgrade-merge-conflict') {
            return Promise.resolve();
          }
        },
      },
    });
  });
</script>

<style>
  @import '~firebaseui/dist/firebaseui.css';

  #firebaseui-auth-container {
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #firebaseui-auth-container > div {
    background-color: white;
  }
</style>

<div id="firebaseui-auth-container" />
