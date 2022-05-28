<script lang=ts>
    import Nav from './Nav.svelte'
    import Canvas from './Canvas.svelte'
    import Toolbar from './Toolbar.svelte'
    import SkinViewer from './SkinViewer.svelte'

    import skin from 'src/ts/utils/skin'
    import canvas_data from 'src/ts/canvas_data'

    let steve = new skin(false)

    let canvas: canvas_data
</script>

<div class="container">
    <Nav/>
    <div class="main">
        <section class="editor">
            <Canvas bind:canvas current_section={steve.head.outer.front}/>
            <Toolbar {canvas}/>
        </section>
        <section class="skin_viewer">
            <SkinViewer skin={steve}/>
        </section>
    </div>
</div>

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

    .skin_viewer {
        overflow: hidden;
    }
</style>