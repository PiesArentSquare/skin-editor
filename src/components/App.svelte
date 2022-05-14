<script lang=ts>
    import { onMount } from 'svelte'
    import Nav from './Nav.svelte'
    import Canvas from './Canvas.svelte'
    import Toolbar from './Toolbar.svelte'

    import skin from 'src/ts/utils/skin'
    import canvas_data from 'src/ts/canvas_data'
    import { in_text_field } from 'src/ts/stores'

    let steve = new skin(false)

    let canvas: Canvas
    let data: canvas_data
    
    let mounted = false
    onMount(() => mounted = true)
    $: if(mounted) data = canvas.get_data()
</script>

<div class="container">
    <Nav/>
    <div class="main">
        <section class="editor">
            <Canvas bind:this={canvas} current_section={steve.head.outer.front}/>
            <Toolbar canvas={data}/>
        </section>
    </div>
</div>

<svelte:window on:keydown={e => {
    if (!$in_text_field && e.code == 'KeyZ' && e.ctrlKey) {
        if (e.shiftKey) canvas.redo()
        else canvas.undo()
    }
}}/>

<style lang=scss>
    @use 'src/styles/common';

    .container {
        height: 100vh;
        display: flex;
        flex-direction: column;
    }
    
    .main {
        display: flex;
        flex-direction: row;
        flex-grow: 1;
        background-color: common.$bg-color;
    }

    section {
        display: flex;
        flex-direction: column;
        width: 50%;
        margin: 0;
        padding: 0;
    }
</style>