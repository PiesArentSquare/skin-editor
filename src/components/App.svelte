<script lang=ts>
    import Nav from './Nav.svelte'
    import Canvas from './Canvas.svelte'
    import Toolbar from './Toolbar.svelte'
    import SkinViewer from './SkinViewer.svelte'
    import SectionSelector from './SectionSelector.svelte'

    import skin from 'src/ts/utils/skin'
    import type i_canvas from 'src/ts/utils/canvas'
    import { current_section } from 'src/ts/stores'
    import type i_resizer from 'src/ts/utils/resizer';

    let steve = new skin(false)
    
    let canvas: i_canvas
    let canvas_resizer: i_resizer
    let viewer_resizer: i_resizer
    
    current_section.set(steve.head.inner.front)

    function onresize(e: UIEvent) {
        canvas_resizer.on_presize()
        viewer_resizer.on_presize()

        canvas_resizer.on_resize()
        viewer_resizer.on_resize()
    }
</script>

<div class="container">
    <Nav bind:skin={steve}/>
    <div class="main">
        <SectionSelector skin={steve}/>
        <section class="editor">
            <Canvas bind:canvas bind:resizer={canvas_resizer}/>
            <Toolbar {canvas}/>
        </section>
        <section class="skin_viewer">
            <SkinViewer skin={steve} bind:resizer={viewer_resizer}/>
        </section>
    </div>
</div>

<svelte:window on:resize={onresize}/>

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