<script lang=ts>
    import { onMount } from 'svelte'
    import canvas_data from 'src/ts/canvas_data'
    import { skin_section } from 'src/ts/utils/skin'
    import { in_text_field } from 'src/ts/stores'

    export let canvas: canvas_data = undefined
    export let current_section: skin_section

    let html_element: HTMLCanvasElement

    let mounted = false
    onMount(() => {
        mounted = true
        canvas = new canvas_data(html_element, current_section)
    })
    $: if (mounted && current_section) canvas.set_section(current_section)

    function onkeydown(e: KeyboardEvent) {
        if (!$in_text_field && e.code === 'KeyZ' && e.ctrlKey) {
            if (e.shiftKey) canvas.redo()
            else canvas.undo()
        }
    }
</script>

<div class="canvas-wrapper">
    <canvas bind:this={html_element} on:mousedown={e => canvas.mousedown(e)} on:mousemove={e => canvas.mousemove(e)} style="background-size: calc(1/{current_section.width}*100%);"/>
</div>

<svelte:window on:mouseup={e => canvas.mouseup(e)} on:keydown={onkeydown}/>

<style lang=scss>
    @use 'src/styles/common';

    .canvas-wrapper {
        display: flex;
        flex-grow: 1;
        justify-content: center;
        align-items: center;
        margin: 1rem 1rem;
    }
    
    canvas {
        display: block;
        width: 400px;
        max-width: 100%;
        min-width: 40%;
        @include common.transparent;
        @include common.double-border-shadow;
    }

    @media (min-width: 800px) {
        .canvas-wrapper {
            margin: 3rem 1rem;
        }
    }
</style>