import color from "src/ts/utils/color"
import { command_group, undo_redo_stack, type command } from "src/ts/utils/command"
import { skin_section } from "./utils/skin"

export class paint_pixel implements command {
    private canvas: canvas_data
    private x: number
    private y: number
    private old: color
    private new: color
    private overwrite_alpha: boolean
    
    constructor(canvas: canvas_data, x: number, y: number, value: color, overwrite_alpha: boolean = false) {
        this.canvas = canvas
        this.x = x
        this.y = y
        this.old = canvas.get_pixel(x, y).copy()
        this.new = value
        this.overwrite_alpha = overwrite_alpha
    }
    
    do(): void {
        this.canvas.paint_pixel(this.x, this.y, this.new, this.overwrite_alpha)
    }
    
    undo(): void {
        this.canvas.paint_pixel(this.x, this.y, this.old, true)
    }
}

export interface tool {
    start(x: number, y: number, canvas: canvas_data): void
    drag(x: number, y: number, canvas: canvas_data): void
    finish(canvas: canvas_data): command | void
}

function get_style_as_number(element: HTMLElement, prop: string) {
    return parseFloat(window.getComputedStyle(element).getPropertyValue(prop).split('px')[0])
}

export default class canvas_data {
    
    current_section: skin_section
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private default_css_width: string
    private default_css_min_width: string
    private default_css_max_width: string
    private border_width: number
    private pixel_size: number
    
    private painting = false
    private ur_stack = new undo_redo_stack
    current_tool: tool | undefined = undefined
    
    constructor(canvas: HTMLCanvasElement, section: skin_section) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
        this.default_css_width = canvas.style.width
        this.default_css_min_width = canvas.style.minWidth
        this.default_css_max_width = canvas.style.maxWidth
        this.border_width = get_style_as_number(canvas, 'border-width')
        this.current_section = section
    }
    
    resize() {
        // clear the height so it won't cause overflow
        this.canvas.height = 0

        // reset the canvas width to the original style so it can recalulate
        this.canvas.style.width = this.default_css_width
        this.canvas.style.minWidth = this.default_css_min_width
        this.canvas.style.maxWidth = this.default_css_max_width
        // the maximum width will be the one set by css
        const max_width = get_style_as_number(this.canvas, 'width')
        

        const max_height = this.canvas.parentElement.clientHeight - this.border_width * 2
        
        const aspect = this.height / this.width
        
        let pixel_perfect_width: number
        // if the limiting factor is the width
        if (max_width < max_height / aspect) {
            // the pixel perfect width is the largest multiple of width less than the max
            pixel_perfect_width = (max_width - max_width % this.width)
        } else {
            // the pixel perfect height is the largest multiple of height less than the max
            const pixel_perfect_height = Math.floor(max_height / this.height) * this.height
            pixel_perfect_width = pixel_perfect_height / aspect
        }
        
        this.canvas.width = pixel_perfect_width
        this.canvas.height = pixel_perfect_width * aspect
        this.canvas.style.width = `${pixel_perfect_width}px`
        this.canvas.style.minWidth = 'unset'
        this.canvas.style.maxWidth = 'unset'
        
        // pixel size is the ratio of canvas pixels to window pixels
        this.pixel_size = this.canvas.width / this.width

        this.repaint()
    }

    set_section(section: skin_section) {
        this.current_section = section
        this.resize()
    }
    
    repaint() {
        this.ctx.clearRect(0, 0, this.width * this.pixel_size, this.height * this.pixel_size)
        this.current_section.pixels.forEach((c, i) => {
            const x = i % this.width
            const y = Math.floor(i / this.width)
            this.ctx.fillStyle = c.to_string()
            this.ctx.fillRect(x * this.pixel_size, y * this.pixel_size, this.pixel_size, this.pixel_size)
        })
    }
    
    paint_pixel(x: number, y: number, c: color, overwrite_alpha = false) {
        if (overwrite_alpha)
        this.ctx.clearRect(x * this.pixel_size, y * this.pixel_size, this.pixel_size, this.pixel_size)
        this.ctx.fillStyle = c.to_string()
        this.ctx.fillRect(x * this.pixel_size, y * this.pixel_size, this.pixel_size, this.pixel_size)
        
        this.current_section.paint_pixel(x, y, c, !(c.a === 1 || overwrite_alpha))
    }
    
    mousedown(e: MouseEvent) {
        if (e.button === 0) {
            this.painting = true
            this.use_tool(e, true)
        } else if (this.painting) {
            this.finish()
        }
    }
    
    mousemove(e: MouseEvent) {
        if (this.painting) {
            e.preventDefault()
            this.use_tool(e)
        }
    }
    
    mouseup(e: MouseEvent) {
        if (this.painting) this.finish()
    }
    
    private use_tool(e: MouseEvent, start = false) {
        if (!this.current_tool) return
        const rect = this.canvas.getBoundingClientRect()
        const ox = e.clientX - rect.left - this.border_width
        const oy = e.clientY - rect.top - this.border_width
        const x = Math.floor(ox / this.pixel_size)
        const y = Math.floor(oy / this.pixel_size)
        if (x >= 0 && y >= 0 && x < this.width && y < this.height) {
            if (start) this.current_tool.start(x, y, this)
            else this.current_tool.drag(x, y, this)
        }
    }
    
    private finish() {
        const c = this.current_tool?.finish(this)
        if (c && !(<command_group>c).is_empty()) this.ur_stack.append(c)
        this.painting = false
    }
    
    get width() { return this.current_section.width }
    get height() { return this.current_section.height }
    get_pixel(x: number, y: number) { return this.current_section.pixels[x + y * this.width] }
    undo() { this.ur_stack.undo() }
    redo() { this.ur_stack.redo() }
}
