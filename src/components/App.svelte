<script lang=ts>
    import Nav from './Nav.svelte'
    import Canvas from './Canvas.svelte'
    import Toolbar from './Toolbar.svelte'
    import SkinViewer from './SkinViewer.svelte'

    import skin from 'src/ts/utils/skin'
    import canvas_data from 'src/ts/canvas_data'
    import { clear_height } from 'src/ts/skin_viewer'

    let steve = new skin(false)

    let canvas: canvas_data

    let sv_resize: () => void

    function on_resize() {
        clear_height()
        canvas.resize()
        sv_resize()
    }
</script>

<div class="container">
    <Nav/>
    <div class="main">
        <section class="editor">
            <Canvas bind:canvas current_section={steve.legs.left.outer.front}/>
            <Toolbar {canvas}/>
        </section>
        <section class="skin_viewer">
            <SkinViewer bind:resize={sv_resize} skin={steve}/>
        </section>
    </div>
</div>

<svelte:window on:resize={on_resize}/>

<style lang=scss>
    @use 'src/styles/common';

    .container {
        height: 100vh;
        display: flex;
        flex-direction: column;
    }
    
    .main {
        display: flex;
        flex-direction: column-reverse;
        flex-grow: 1;
        background-color: common.$bg-color;
    }

    section {
        display: flex;
        flex-direction: column;
        margin: 0;
        padding: 0;
    }

    .editor {
        flex-grow: 1;
    }
    
    .skin_viewer {
        height: 30vh;
        overflow: hidden;
    }

    @media (min-width: 800px) {
        .main {
            flex-direction: row;
        }

        .skin_viewer {
            height: unset;
        }

        section {
            width: 50%;
        }
    }
</style>