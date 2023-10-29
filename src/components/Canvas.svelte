<script lang=ts>
    import { onMount } from 'svelte'
    import { in_text_field, current_section } from 'src/ts/stores'
    import type i_canvas from 'src/ts/utils/canvas'
    import type i_tool from 'src/ts/utils/tool'
    import { undo_redo_stack, command_group } from 'src/ts/utils/command'
    import color from 'src/ts/utils/color'
    import type i_resizer from 'src/ts/utils/resizer'
    
    let ur_stack = new undo_redo_stack
    export const canvas: i_canvas = {
        paint_pixel,
        get_pixel,
        undo: ur_stack.undo.bind(ur_stack),
        redo: ur_stack.redo.bind(ur_stack),
        set current_tool(tool: i_tool) { current_tool = tool }
    }

    export const resizer: i_resizer = {
        on_presize() {
            html_element.style.width = '1px'
            html_element.style.height = '1px'
        },

        on_resize() {
            const max_width = html_element.parentElement!.clientWidth - border_width * 2,
                max_height = html_element.parentElement!.clientHeight - border_width * 2

            console.log(max_height)

            const width_ratio = max_width / $current_section.width
            const height_ratio = max_height / $current_section.height
            const scale = width_ratio < height_ratio ? width_ratio : height_ratio

            html_element.style.width = `${$current_section.width * scale}px`
            html_element.style.height = `${$current_section.height * scale}px`
        },
    }

    let html_element: HTMLCanvasElement
    let ctx: CanvasRenderingContext2D
    let border_width: number
    onMount(() => {
        ctx = html_element.getContext('2d', { willReadFrequently: true })!
        border_width = parseFloat(window.getComputedStyle(html_element).borderWidth.split('px')[0])
    })

    $: if ($current_section && html_element) {
        $current_section.load(html_element)
        ur_stack = new undo_redo_stack
        resizer.on_presize()
        resizer.on_resize()
    }

    function paint_pixel(x: number, y: number, c: color, overwrite_alpha = false): void {
        if (overwrite_alpha)
            ctx.clearRect(x, y, 1, 1)
        ctx.fillStyle = c.to_string()
        ctx.fillRect(x, y, 1, 1)
        
        $current_section.paint_pixel(x, y, c, overwrite_alpha)
    }
    
    function get_pixel(x: number, y: number) {
        return $current_section.get_pixel(x, y)
    }
    
    
    let current_tool: i_tool | undefined

    let painting = false

    function onkeydown(e: KeyboardEvent) {
        if (!$in_text_field && e.code === 'KeyZ' && e.ctrlKey) {
            if (e.shiftKey) ur_stack.redo()
            else ur_stack.undo()
        }
    }

    function use_tool(e: MouseEvent, start = false) {
        if (!current_tool)
            return

        const rect = html_element.getBoundingClientRect()
        const raw_x = e.clientX - rect.left - border_width
        const raw_y = e.clientY - rect.top - border_width
        const x = Math.floor(raw_x * $current_section.width / html_element.clientWidth)
        const y = Math.floor(raw_y * $current_section.height / html_element.clientHeight)
        if (x >= 0 && y >= 0 && x < $current_section.width && y < $current_section.height) {
            if (start) 
                current_tool.start(x, y, canvas)
            else
                current_tool.drag(x, y, canvas)
        }
    }

    function finish() {
        const c = current_tool?.finish(canvas)
        if (c && !(<command_group>c).is_empty()) ur_stack.append(c)
        painting = false
    }

    function onmousedown(e: MouseEvent) {
        if (e.button === 0) {
            painting = true
            use_tool(e, true)
        } else if (painting) {
            finish()
        }
    }

    function onmousemove(e: MouseEvent) {
        if (painting) {
            e.preventDefault
            use_tool(e)
        }
    }

    function onmouseup(e: MouseEvent) {
        if (painting) finish()
    }

</script>

<div class="canvas-wrapper">
    <canvas
        bind:this={html_element}
        on:mousedown={onmousedown}
        on:mousemove={onmousemove}
        style="background-size: {100/$current_section.width}%"
    />
</div>

<svelte:window
    on:mouseup={onmouseup}
    on:keydown={onkeydown}
/>

<style lang=scss>
    @use 'src/styles/common';

    .canvas-wrapper {
        display: flex;
        flex-grow: 1;
        justify-content: center;
        align-items: center;
        margin: 1rem 1rem;
    }
    
    canvas {
        display: block;
        @include common.transparent;
        @include common.double-border-shadow;
    }

    @media (min-width: 800px) {
        .canvas-wrapper {
            margin: 3rem 1rem;
        }
    }
</style>