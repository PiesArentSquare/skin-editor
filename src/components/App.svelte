<script lang=ts>
    import Nav from './Nav.svelte'
    import Canvas from './Canvas.svelte'
    import Toolbar from './Toolbar.svelte'
    import SkinViewer from './SkinViewer.svelte'
    import SectionSelector from './SectionSelector.svelte'

    import skin from 'src/ts/utils/skin'
    import type i_canvas from 'src/ts/utils/canvas'
    import { clear_height } from 'src/ts/skin_viewer'

    let steve = new skin(false)

    let canvas: i_canvas

    let current_section = steve.head.inner.front

    let sv_resize: () => void

    function on_resize() {
        clear_height()
        sv_resize()
    }
</script>

<div class="container">
    <Nav/>
    <div class="main">
        <SectionSelector skin={steve} bind:current_section/>
        <section class="editor">
            <Canvas bind:canvas {current_section}/>
            <Toolbar {canvas}/>
        </section>
        <section class="skin_viewer">
            <SkinViewer bind:resize={sv_resize} skin={steve}/>
        </section>
    </div>
</div>

<svelte:window on:load={on_resize} on:resize={on_resize}/>

<style lang=scss>
    @use 'src/styles/common';

    .container {
        height: 100vh;
        display: flex;
        flex-direction: column;
    }
    
    .main {
        display: grid;
        grid-template-rows: min-content 30vh 1fr;
        flex-grow: 1;
        background-color: common.$bg-color;
    }

    section {
        display: flex;
        flex-direction: column;
        margin: 0;
        padding: 0;
    }
    
    .skin_viewer {
        grid-row: 2;
    }

    @media (min-width: 800px) {
        .main {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: min-content 1fr;
        }

        .skin_viewer {
            grid-column: 2;
            grid-row: 1 / 3;
            height: unset;
        }
    }
</style>