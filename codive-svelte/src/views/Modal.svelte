<script>
  import { createEventDispatcher } from 'svelte';

  export let user;
  let meetingId;

  const dispatch = createEventDispatcher();
  const submit = () => dispatch('submit', { id: meetingId });
</script>

<style>
  h2 {
    margin-top: 0;
  }
  button,
  input {
    font-size: 14px;
  }
  /* MODAL */
  .modal.visible {
    display: flex;
  }
  /* The Modal (background) */
  .modal {
    display: none;
    align-items: center;
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.8);
  }

  /* Modal Content */
  .modal-content {
    width: 50%;
    background-color: #fefefe;
    border: 1px solid #888;
    border-radius: 4px;
    margin: auto;
    padding: 24px 24px;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.2);
    animation-name: animatetop;
    animation-duration: 0.4s;
  }

  /* Add Animation */
  @-webkit-keyframes animatetop {
    from {
      top: -300px;
      opacity: 0;
    }
    to {
      top: 0;
      opacity: 1;
    }
  }

  @keyframes animatetop {
    from {
      top: -300px;
      opacity: 0;
    }
    to {
      top: 0;
      opacity: 1;
    }
  }

  /* The Close Button */
  /* .close {
    color: white;
    float: right;
    font-size: 28px;
    font-weight: bold;
  }

  .close:hover, .close:focus {
    color: #000;
    text-decoration: none;
    cursor: pointer;
  } */
</style>

<div class="modal visible">
  <div class="modal-content">
    <!-- <span class='close' onclick=${CloseModal}>×</span> -->
    <h2>Join a Meeting</h2>
    <p>{user.name}, enter the Meeting ID:</p>
    <p>
      <input placeholder="Meeting ID" bind:value={meetingId} />
      <button on:click={submit}>JOIN</button>
    </p>
  </div>
</div>
