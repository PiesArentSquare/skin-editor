<script lang=ts>
    import { onMount } from 'svelte'
    import create_scene, { update_texture, set_slim } from 'src/ts/skin_viewer'
    import skin_ from 'src/ts/utils/skin'
    import type i_resizer from 'src/ts/utils/resizer';

    export let skin: skin_
    let slim: boolean
    skin.subscribe(() => {
        update_texture(skin.get_image_url())
        if (slim != skin.slim) {
            set_slim(skin.slim)
            slim = skin.slim
        }
    })
    
    let canvas: HTMLCanvasElement
    let resize: () => void, presize: () => void

    onMount(() => {
        [presize, resize] = create_scene(canvas, skin)
        update_texture(skin.get_image_url())
    })

    export const resizer: i_resizer = {
        on_presize: () => presize(),
        on_resize: () => resize(),
    }

</script>

<canvas bind:this={canvas}></canvas>

<style lang=scss>
    canvas {
        width: 100%;
        height: 100%;
    }
</style>