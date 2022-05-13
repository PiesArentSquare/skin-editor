<script lang=ts>
    import { onMount } from 'svelte'
    import canvas_data from 'src/ts/canvas_data'
    import { skin_section } from 'src/ts/utils/skin'

    export let current_section: skin_section

    let canvas: HTMLCanvasElement
    let data: canvas_data
    export function get_data() { return data }
    export function undo() { data.undo() }
    export function redo() { data.redo() }

    let mounted = false
    onMount(() => {
        mounted = true
        data = new canvas_data(canvas, current_section)
    })
    $: if (mounted && current_section) data.set_section(current_section)

</script>

<div class="canvas-wrapper">
    <canvas bind:this={canvas} on:mousedown={e => data.mousedown(e)} on:mousemove={e => data.mousemove(e)} style="--canvas-width: {current_section.width}"/>
</div>

<svelte:window on:mouseup={e => data.mouseup(e)} on:resize={() => data.resize()}/>

<style lang=scss>
    @use 'src/styles/common';

    .canvas-wrapper {
        display: flex;
        flex-grow: 1;
    }

    canvas {
        display: block;
        margin: auto;
        width: 40%;
        @include common.transparent;
        background-size: calc(1/var(--canvas-width)*100%);
        @include common.double-border-shadow;
    }
</style>