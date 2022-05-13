<script lang=ts>
    import { onMount } from 'svelte'
    import ColorPicker from './ColorPicker.svelte'

    import { pen_tool, eraser_tool, fill_tool } from 'src/ts/tools'
    import canvas_data, { type tool } from 'src/ts/canvas_data'

    import Fa from 'svelte-fa'
    import { faEraser, faFillDrip, faPen, type IconDefinition } from '@fortawesome/free-solid-svg-icons'

    export let canvas: canvas_data

    interface tool_entry {
        tool: tool,
        name: string,
        icon: IconDefinition,
        keybind: string,
    }

    let tools: tool_entry[] = [
        { tool: new pen_tool, name: 'pen', icon: faPen, keybind: 'KeyB' },
        { tool: new eraser_tool, name: 'eraser', icon: faEraser, keybind: 'KeyE' },
        { tool: new fill_tool, name: 'fill', icon: faFillDrip, keybind: 'KeyF' },
    ]
    let current_tool = tools[0]

    let mounted = false
    onMount(() => mounted = true)
    $: if (mounted) canvas.current_tool = current_tool.tool
</script>

<div class="toolbar">
    <ColorPicker/>
    <div class="tools">
    {#each tools as tool}
        <input type="radio" bind:group={current_tool} name=tool id={tool.name} value={tool}>
        <label for={tool.name}>
            <Fa icon={tool.icon} size=lg/>
        </label>
    {/each}
    </div>
</div>

<svelte:window on:keydown={e =>{
    const s = tools.filter(t => t.keybind === e.code)
    if (s.length > 0) current_tool = s[0]
}}/>

<style lang=scss>
    @use 'src/styles/common';

    .toolbar {
        display: flex;
        align-items: center;
        padding: 1.5rem;
        background-color: white;
    }

    .tools {
        display: flex;
        align-items: center;
        width: 100%;
    }

    input {
        all: unset;
        font-size: 1rem;
    }

    input:checked+label {
        border-radius: common.$border-radius;
        background-color: common.$secondary-color;
        color: white;
    }

    label {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 1.5rem;
        width: 1.5rem;
        padding: .25rem;
        margin-right: .5rem;
        
        cursor: pointer;
        color: common.$secondary-color;
    }
</style>