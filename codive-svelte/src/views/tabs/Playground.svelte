<script>
  import {
    onMount,
    afterUpdate,
    getContext,
    createEventDispatcher,
  } from 'svelte';
  import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
  import * as Firepad from '../../utils/firepad';
  import { debounce } from '../../utils/utils';

  export let isActiveTab;
  export let previewHTML;
  export let user;

  const dispatch = createEventDispatcher();

  let editor;
  let editorEl;
  const defaultEditorText = `<!DOCTYPE html>
<html>
<head>
    <title>Welcome</title>
</head>

<body>
    <p>Welcome to this workshop!</p>
</body>
</html>`;

  onMount(() => {
    editor = monaco.editor.create(editorEl, {
      language: 'html',
      minimap: {
        enabled: false,
      },
      // theme: 'vs-dark',
      // autoLayout: true,
    });
    // TODO: fix and move direct firebase call
    const firepadRef = getContext('firebase')
      .database()
      .ref(`code/${user.uid}`);
    const pad = Firepad.fromMonaco(firepadRef, editor, {
      userId: user.uid,
      defaultText: defaultEditorText,
    });
    editor.layout();
    window.addEventListener(
      'resize',
      debounce(() => {
        editor.layout();
      }, 500)
    );
    editor.getModel().onDidChangeContent(
      debounce((event) => {
        dispatch('updateText', { text: editor.getValue() });
      }, 500)
    );
  });

  afterUpdate(() => {
    editor.layout();
  });
</script>

<style>
  .hidden {
    display: none !important;
  }
  .playground {
    display: flex;
    flex-direction: row;
    margin: 16px 24px;
    flex: 1;
  }
  #editor {
    /* width: 100%; */
    flex: 1.3;
    max-width: calc(50% * 1.3);
  }
  #preview {
    /* height: 100%; */
    flex: 1;
    /* padding-left: 8px; */
  }
  #preview iframe {
    min-width: 0;
    width: 100%;
    height: 100%;
  }
</style>

<div class:hidden={!isActiveTab} class="playground">
  <div id="editor" bind:this={editorEl} />
  <div id="preview">
    <iframe srcdoc={previewHTML} title="Editor Preview" />
  </div>
</div>
