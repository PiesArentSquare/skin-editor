<script lang=ts>
    import DualSlider from './DualSlider.svelte'
    import VerticalSlider from './VerticalSlider.svelte'
    import DropdownMenu from './DropdownMenu.svelte'
    import InputField from './InputField.svelte'
    
    import { current_color } from 'src/ts/stores'
    import color from 'src/ts/utils/color'
    import click_outside from 'src/ts/utils/click_outside'
    
    export let enablealpha = true

    let open = false
    
    let input_type = 'hsv'
    let hue = 0, saturation = 100, value = 100, alpha = 100
    let hex: string

    $: {
        current_color.set(color.from_hsv(hue, saturation / 100, value / 100, alpha / 100))
        hex = $current_color.to_hex()
    }

    function set_color_from_hex() {
        current_color.set(color.from_hex(hex))
        const [h, s, v, a] = $current_color.to_hsv()
        hue = h
        saturation = s * 100
        value = v * 100
        alpha = a * 100
    }

</script>

<div class="color-picker" style="color: {$current_color.to_string()}" on:click|self={() => open = !open} use:click_outside on:outclick={() => open = false}>
{#if open}
    <div class="picker-window">
        <div class="slider-area" style="--color:{$current_color.to_string()}; --color-noalpha:{$current_color.with_full_alpha().to_string()}; --hue:{hue}">
            <DualSlider bind:x={saturation} bind:y={value} name="sv"/>
            <VerticalSlider bind:value={hue} max={360} name="hue"/>
            {#if enablealpha}
            <VerticalSlider bind:value={alpha} inverted name="alpha"/>
            {/if}
        </div>
        <div class="input-area">
            <DropdownMenu list={['hsv', 'hex']} bind:value={input_type}/>
            {#if input_type === 'hsv'}
                <InputField bind:value={hue} max={360} min={0} name="hue"/>
                <InputField bind:value={saturation} max={100} min={0} name="saturation"/>
                <InputField bind:value={value} max={100} min={0} name="value"/>
                {#if enablealpha}
                    <InputField bind:value={alpha} max={100} min={0} name="alpha"/>
                {/if}
            {:else}
                <InputField bind:value={hex} type=text name="hex" on:focusout={set_color_from_hex}/>
            {/if}
        </div>
    </div>
{/if}
</div>

<style lang=scss>
    @use 'src/styles/common';

    .slider-area :global(.sv.slider) {
        background-image: linear-gradient(#00000000, #000), linear-gradient(90deg, #fff, hsl(var(--hue), 100%, 50%));
    }

    .slider-area :global(.sv.handle) {
        color: var(--color-noalpha);
    }

    .slider-area :global(.hue.slider) {
        background-image: linear-gradient(to bottom, #f00 0%, #ff0 16.66%, #0f0 33.33%, #0ff 50%, #00f 66.66%, #f0f 83.33%, #f00 100%);
    }

    .slider-area :global(.hue.handle) {
        color: hsl(var(--hue), 100%, 50%)
    }

    .slider-area :global(.alpha.slider) {
        background-image: linear-gradient(to bottom, var(--color-noalpha), transparent), common.$tranparency;
        background-size: .5rem;
        image-rendering: pixelated;
    }

    .slider-area :global(.alpha.handle) {
        color: var(--color)
    }

    .color-picker {
        flex-shrink: 0;
        position: relative;
        width: 2rem;
        height: 2rem;
        margin-right: 3rem;

        @include common.double-border-shadow;
        @include common.transparent-color;
        cursor: pointer;
    }

    .picker-window {
        position: absolute;
        
        bottom: 3rem;
        left: -3px; // account for border-width
        padding: 1rem;
        
        @include common.double-border-shadow;
        background-color: white;
        color: black;
        cursor: default;
    }

    .slider-area {
        display: flex;
        flex-direction: row;
        flex-shrink: 0;
        justify-content: space-between;
    }

    .input-area {
        margin-top: 1rem;
        display: flex;
    }

</style>