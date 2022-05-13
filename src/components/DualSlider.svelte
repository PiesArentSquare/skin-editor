<script lang=ts>
    import { clamp, map } from 'src/ts/utils/math_utils'

    export let x: number, y: number
    export let max_x = 100, max_y = 100
    export let name = ''

    let slider: HTMLDivElement
    let dragging = false

    function set_handle(click_x: number, click_y: number) {
        const rect = slider.getBoundingClientRect()
        x = map(clamp(click_x, rect.left, rect.right), rect.left, rect.right, 0, max_x)
        y = max_y - map(clamp(click_y, rect.top, rect.bottom), rect.top, rect.bottom, 0, max_y)
    }

    function mousedown(e: MouseEvent) {
        if (e.button === 0) {
            dragging = true
            set_handle(e.clientX, e.clientY)
        } else dragging = false
    }

    function mouseup() { dragging = false }

    function mousemove(e: MouseEvent) {
        if (dragging) {
            e.preventDefault()
            set_handle(e.clientX, e.clientY)
        }
    }
</script>

<div class="slider {name}" bind:this={slider} on:mousedown={mousedown}>
    <div class="handle {name}" style="left: {x * 100 / max_x}%; top: {(max_y - y) * 100 / max_y}%;"></div>
</div>

<svelte:window on:mouseup={mouseup} on:mousemove={mousemove}/>

<style lang=scss>
    @use 'src/styles/common';

    .slider {
        width: 12rem;
        height: 12rem;

        border-radius: common.$border-radius-sm;
        box-shadow: common.$shadow;
        cursor: pointer;
    }

    .handle {
        position: relative;
        width: .5rem;
        height: .5rem;
        transform: translate(-50%, -50%);
        
        background-color: currentColor;
        @include common.double-border-sm;
    }
</style>