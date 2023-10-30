import type i_canvas from './utils/canvas'
import color, { colors } from './utils/color'
import { command_group } from './utils/command'
import type i_command from './utils/command'
import type i_tool from './utils/tool'
import { paint_pixel } from './commands'
import { current_color, current_section } from './stores'
import { skin_section } from './utils/skin'

let current: color
current_color.subscribe(value => { current = value })

let section: skin_section
current_section.subscribe(value => { section = value })

const color_will_change = (old_c: color, new_c: color, overwrite_alpha: boolean): boolean => {
    return !((old_c.equals(new_c) && new_c.a === 255) || new_c.a === 0) || overwrite_alpha
}

interface brush_return {
    c: color,
    overwrite: boolean
}
abstract class brush_tool implements i_tool {
    protected currentStroke = new command_group
    protected visitedPixels = Array<number>()
    protected draw(x: number, y: number, canvas: i_canvas): void {
        const p = this.visitedPixels.find(e => e === x + y * section.width)
        const result = this.use_color(canvas)
        if (p === undefined && color_will_change(canvas.get_pixel(x, y), result.c, result.overwrite)) {
            this.currentStroke.add(new paint_pixel(canvas, x, y, result.c, result.overwrite))
            this.visitedPixels.push(x + y * section.width)
        }
    }
    protected abstract use_color(canvas: i_canvas): brush_return

    start(x: number, y: number, canvas: i_canvas): void { this.draw(x, y, canvas) }
    drag(x: number, y: number, canvas: i_canvas): void { this.draw(x, y, canvas) }
    finish(_canvas: i_canvas): i_command {
        const c = this.currentStroke.copy()
        this.currentStroke.reset()
        this.visitedPixels.length = 0
        return c
    }
}

export class pen_tool extends brush_tool {
    protected use_color(canvas: i_canvas): brush_return {
        return { c: current.copy(), overwrite: false }
    }
}

export class eraser_tool extends brush_tool {
    protected use_color(canvas: i_canvas): brush_return {
        return { c: section.alpha_enabled ? colors.transparent : colors.white, overwrite: section.alpha_enabled }
    }
}

export class eyedropper_tool implements i_tool {

    private onFinish: (() => void) | undefined

    constructor(onFinish?: () => void) {
        this.onFinish = onFinish
    }

    start(x: number, y: number, canvas: i_canvas): void {
        current_color.set(canvas.get_pixel(x, y))
    }
    drag(x: number, y: number, canvas: i_canvas): void {
        current_color.set(canvas.get_pixel(x, y))
    }
    finish(_canvas: i_canvas): void {
        if (this.onFinish) this.onFinish()
    }
}

export class fill_tool implements i_tool {
    private pixels: command_group = new command_group

    private fill_impl(x: number, y: number, old: color, canvas: i_canvas): void {
        if (x < 0 || x >= section.width || y < 0 || y >= section.height) return
        if (!canvas.get_pixel(x, y).equals(old) || this.pixels.size() >= section.width * section.height) return
        this.pixels.add(new paint_pixel(canvas, x, y, current))

        this.fill_impl(x - 1, y, old, canvas)
        this.fill_impl(x + 1, y, old, canvas)
        this.fill_impl(x, y - 1, old, canvas)
        this.fill_impl(x, y + 1, old, canvas)
    }

    start(x: number, y: number, canvas: i_canvas): void {
        let old = canvas.get_pixel(x, y)
        if (!color_will_change(old, current, false)) return
        this.fill_impl(x, y, old, canvas)
    }
    drag(_x: number, _y: number, _canvas: i_canvas): void { }
    finish(_canvas: i_canvas): void | i_command {
        const p = this.pixels.copy()
        this.pixels.reset()
        return p
    }

}