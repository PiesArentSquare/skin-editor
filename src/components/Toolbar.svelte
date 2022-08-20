<script lang=ts>
    import ColorPicker from './ColorPicker.svelte'
    import Fa from 'svelte-fa'
    import { faEraser, faEyeDropper, faFillDrip, faPen, faRotateLeft, faRotateRight, type IconDefinition } from '@fortawesome/free-solid-svg-icons'
    
    import { alpha_enabled, in_text_field } from 'src/ts/stores'

    import { pen_tool, eraser_tool, fill_tool, eyedropper_tool } from 'src/ts/tools'
    import type i_canvas from 'src/ts/utils/canvas'
    import type i_tool from 'src/ts/utils/tool'

    export let canvas: i_canvas

    interface tool_entry {
        tool: i_tool,
        name: string,
        icon: IconDefinition,
        keybind: string,
    }

    let tools: tool_entry[] = [
        { tool: new pen_tool, name: 'pen', icon: faPen, keybind: 'KeyB' },
        { tool: new eraser_tool, name: 'eraser', icon: faEraser, keybind: 'KeyE' },
        { tool: new eyedropper_tool(() => current_tool = tools.filter(t => t.name === 'pen')[0]), name: 'eyedropper', icon: faEyeDropper, keybind: 'KeyI' },
        { tool: new fill_tool, name: 'fill', icon: faFillDrip, keybind: 'KeyF' },
    ]
    let current_tool = tools[0]

    $: if (canvas) canvas.current_tool = current_tool.tool
</script>

<div class="toolbar">
    <ColorPicker enablealpha={$alpha_enabled}/>
    <div class="tools">
    {#each tools as tool}
        <input type="radio" bind:group={current_tool} name=tool id={tool.name} value={tool}>
        <label for={tool.name}>
            <Fa icon={tool.icon} size=lg/>
        </label>
    {/each}
        <div class="tool" on:click={() => canvas.undo()}><Fa icon={faRotateLeft} size=lg/></div>
        <div class="tool" on:click={() => canvas.redo()}><Fa icon={faRotateRight} size=lg/></div>
    </div>
</div>

<svelte:window on:keydown={e =>{
    if (!$in_text_field) {
        const s = tools.filter(t => t.keybind === e.code)
        if (s.length > 0) current_tool = s[0]
    }
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
    
    input:checked+label, .tool:active {
        background-color: common.$secondary-color !important;
        color: white;
    }
    
    label, .tool {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 1.5rem;
        width: 1.5rem;
        padding: .25rem;
        margin-right: .5rem;
        
        cursor: pointer;
        border-radius: common.$border-radius;
        color: common.$secondary-color;
    }

    label:hover, .tool:hover {
        background-color: common.$bg-color;
    }
</style>