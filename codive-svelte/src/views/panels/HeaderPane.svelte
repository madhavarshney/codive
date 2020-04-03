<script>
    import { createEventDispatcher } from 'svelte';
    import Pagination from '../components/Pagination.svelte';

    export let event;
    // export let activeSlide;
    // export let count;
    // export let liveSlide;
    // export let isHost;

    const dispatch = createEventDispatcher();
</script>

<style>
    .slide-header {
        /* background-color: #0D8CF5;
        color: white;
        background: linear-gradient(45deg, #0276D7, #5BAEF3); */
        margin-bottom: 24px;
        background-color: white;
        padding: 24px;
        overflow: hidden;
        display: flex;
        flex-direction: row;
        align-items: center;
    }
    .slide-header-title {
        font-family: Verdana, Geneva, Tahoma, sans-serif;
        font-size: 24px;
        font-weight: bold;
        text-transform: uppercase;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .spacer {
        flex: 1;
    }
</style>

<div class='slide-header rounded-panel'>
    <span class='slide-header-title' title={event.title}>{event.title}</span>
    <span class='spacer'></span>
    <!-- <Pagination
        {activeSlide}
        {count}
        {liveSlide}
        {isHost}
		on:prevSlide
		on:nextSlide
		on:goToLiveSlide
		on:setSlide
    /> -->
</div>
