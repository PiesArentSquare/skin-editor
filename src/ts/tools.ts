import canvas_data, { type tool, paint_pixel } from './canvas_data'
import color from './utils/color'
import {type command, command_group} from './utils/command'
import { current_color } from './stores'

let current: color
current_color.subscribe(value => { current = value })

const color_will_change = (old_c: color, new_c: color): boolean => {
    return !((old_c.equals(new_c) && new_c.a === 1) || new_c.a === 0)
}

interface brush_return {
    c: color,
    overwrite: boolean
}
abstract class brush_tool implements tool {
    protected currentStroke = new command_group
    protected visitedPixels = Array<number>()
    protected draw(x: number, y: number, canvas: canvas_data): void {
        const p = this.visitedPixels.find(e => e === x + y * canvas.width)
        const result = this.use_color(canvas)
        if (p === undefined && color_will_change(canvas.get_pixel(x, y), result.c)) {
            this.currentStroke.add(new paint_pixel(canvas, x, y, result.c, result.overwrite))
            this.visitedPixels.push(x + y * canvas.width)
        }
    }
    protected abstract use_color(canvas: canvas_data): brush_return

    start(x: number, y: number, canvas: canvas_data): void { this.draw(x, y, canvas) }
    drag(x: number, y: number, canvas: canvas_data): void { this.draw(x, y, canvas) }
    finish(_canvas: canvas_data): command {
        const c = this.currentStroke.copy()
        this.currentStroke.reset()
        this.visitedPixels.length = 0
        return c
    }
}

export class pen_tool extends brush_tool {
    protected use_color(canvas: canvas_data): brush_return {
        return {c: current, overwrite: false}
    }
}

export class eraser_tool extends brush_tool {
    protected use_color(canvas: canvas_data): brush_return {
        return {c: canvas.current_section.alpha_enabled ? color.transparent : color.white, overwrite: canvas.current_section.alpha_enabled}
    }
}

export class eyedropper_tool implements tool {

    private onFinish: (() => void) | undefined

    constructor(onFinish?: () => void) {
        this.onFinish = onFinish
    }

    start(x: number, y: number, canvas: canvas_data): void {
        current_color.set(canvas.get_pixel(x, y))
    }
    drag(x: number, y: number, canvas: canvas_data): void {
        current_color.set(canvas.get_pixel(x, y))
    }
    finish(_canvas: canvas_data): void {
        if(this.onFinish) this.onFinish()
    }
}

export class fill_tool implements tool {
    private pixels: command_group = new command_group
    
    private fill_impl(x: number, y: number, old: color, canvas: canvas_data): void {
        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return
        if (!canvas.get_pixel(x, y).equals(old)) return
        this.pixels.add(new paint_pixel(canvas, x, y, current))

        this.fill_impl(x - 1, y, old, canvas)
        this.fill_impl(x + 1, y, old, canvas)
        this.fill_impl(x, y - 1, old, canvas)
        this.fill_impl(x, y + 1, old, canvas)
    }

    start(x: number, y: number, canvas: canvas_data): void {
        let old = canvas.get_pixel(x, y)
        if (!color_will_change(old, current)) return
        this.fill_impl(x, y, old, canvas)
    }
    drag(_x: number, _y: number, _canvas: canvas_data): void {}
    finish(_canvas: canvas_data): void | command {
        const p = this.pixels.copy()
        this.pixels.reset()
        return p
    }

}