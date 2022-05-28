<script lang=ts>
    import { createEventDispatcher } from "svelte"
    import { in_text_field } from "src/ts/stores"

    export let value: string | number
    export let name: string
    export let min: number = undefined
    export let max: number = undefined
    $: internal_value = typeof(value) === 'number' ? Math.round(value) : value

    let input: HTMLInputElement

    const dispatch = createEventDispatcher()

    function finalize_number() {
        if (internal_value < min) internal_value = min
        else if (internal_value > max) internal_value = max
        value = internal_value
        dispatch("focusout")
        in_text_field.set(false)
    }

    function finalize_text() {
        value = internal_value
        dispatch("focusout")
        in_text_field.set(false)
    }

    function onkeydown(e: KeyboardEvent) {
        if (typeof(value)  === 'number' && e.code === 'KeyE') e.preventDefault()
        else if (e.code === 'Enter') input.blur() // who tf decided this was a remotely acceptable name?
    }
</script>

<div class="input">
{#if typeof(value)  === 'number'}
    <input bind:this={input} type="number" {min} {max} id={name} bind:value={internal_value} style="text-align: right;" on:focusout={finalize_number} on:focus={() => in_text_field.set(true)} on:keydown={onkeydown}/>
{:else}
    <input bind:this={input} type="text" id={name} bind:value={internal_value} on:focusout={finalize_text} on:focus={() => in_text_field.set(true)} on:keydown={onkeydown}/>
{/if}
    <label for="input">{name}</label>
</div>

<style lang=scss>
    @use 'src/styles/common';

    .input {
        border-right: 2px solid common.$bg-color;
        width: 100%;
        padding: .25rem;
    }

    .input:last-of-type {
        border-right: 0;
    }

    input {
        all: unset;
        font-size: 1rem;
        width: 100%;
        cursor: text;
    }

    label {
        display: none;
    }
</style>