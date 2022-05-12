<script lang=ts>
    import Nav from './Nav.svelte'
    import Canvas from './Canvas.svelte'

    import skin from 'src/ts/utils/skin'

    let steve = new skin(false)
</script>

<div class="container">
    <Nav/>
    <div class="main">
        <section class="editor">
            <Canvas current_section={steve.head.outer.front}/>
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
</style>