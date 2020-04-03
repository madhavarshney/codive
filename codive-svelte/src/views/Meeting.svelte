<script>
	import HeaderPane from './panels/HeaderPane.svelte';
	import ContentPane from './panels/ContentPane.svelte';
	import ViewersPane from './panels/ViewersPane.svelte';
	import YouPane from './panels/YouPane.svelte';

	export let state;
	export let meeting;
	export let user;
	export let localSlides;
	export let isHost;

	$: ({ activeSlide, count, slideContent } = localSlides);
	$: ({ reactions, currentTab, previewHTML } = state);
	$: ({ viewers, event, slides } = meeting);
	$: ({ liveSlide } = slides);
	$: ({ jitsiID } = event);
</script>

<style>
	:global(.rounded-panel) {
		border-radius: 16px;
		padding-bottom: 24px;
		-webkit-box-shadow: 0px 0px 8px 0px rgba(0,0,0,0.1);
		-moz-box-shadow: 0px 0px 8px 0px rgba(0,0,0,0.1);
		box-shadow: 0px 0px 8px 0px rgba(0,0,0,0.1);
	}
	.panel {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.left-panel {
		flex: 1;
		overflow: hidden;
		padding: 24px 16px 24px 32px;
	}
	.right-panel {
		width: max(30%, 300px);
		overflow: hidden;
		padding: 24px 32px 24px 16px;
	}
</style>

<div class='panel left-panel'>
	<HeaderPane
		{event}
	/>
	<!--
		{activeSlide}
		{liveSlide}
		{isHost}
		{count} -->
	<ContentPane
		{isHost}
		{activeSlide}
		{slides}
		{currentTab}
		{previewHTML}
		{slideContent}
		{user}
		{jitsiID}
		on:switchTab
		on:liveSlideChange
		on:updateText

		{liveSlide}
		{count}
		on:prevSlide
		on:nextSlide
		on:goToLiveSlide
		on:setSlide
	/>
</div>
<div class='panel right-panel'>
	<ViewersPane {user} {reactions} viewers={meeting.viewers} />
	<YouPane {user} {reactions} on:reaction />
</div>
