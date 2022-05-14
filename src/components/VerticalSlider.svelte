<script lang=ts>
    import { clamp, map } from 'src/ts/utils/math_utils'

    export let value: number
    export let max = 100
    export let inverted = false
    export let name = ''
    $: cssvalue = inverted ? max - value : value

    let slider: HTMLDivElement
    let dragging = false

    function set_handle(click_y: number) {
        const rect = slider.getBoundingClientRect()
        cssvalue = map(clamp(click_y, rect.top, rect.bottom), rect.top, rect.bottom, 0, max)
        value = inverted ? max - cssvalue : cssvalue
    }

    function mousedown(e: MouseEvent) {
        if (e.button === 0) {
            dragging = true
            set_handle(e.clientY)
        } else dragging = false
    }

    function mouseup() { dragging = false }
    
    function mousemove(e: MouseEvent) {
        if (dragging) {
            e.preventDefault()
            set_handle(e.clientY)
        }
    }
</script>

<div class="slider {name}" bind:this={slider} on:mousedown={mousedown}>
    <div class="handle {name}" style="top: {cssvalue * 100 / max}%;"></div>
</div>

<svelte:window on:mouseup={mouseup} on:mousemove={mousemove}/>

<style lang=scss>
    @use 'src/styles/common';

    .slider {
        color: inherit;
        position: relative;
        width: 1rem;
        height: 12rem;
        margin-left: 2rem;
        border-radius: common.$border-radius-sm;
        box-shadow: common.$shadow;
        cursor: pointer;
    }

    .handle {
        position: absolute;
        left: 50%;
        width: 1.5rem;
        height: .5rem;
        transform: translate(-50%, -50%);

        @include common.transparent-color;
        @include common.double-border-sm;
    }
</style>
