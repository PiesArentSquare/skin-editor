import pixelCanvas, {tool, paintPixel} from "./components/pixel_canvas.js"
import color from "./components/color.js"
import colorPicker from "./components/color_picker"
import {command, commandGroup} from "./components/command.js"

const colorWillChange = (oldC: color, newC: color): boolean => {
    return !(oldC.equals(newC) && newC.a === 1)
}

abstract class brush_tool implements tool {
    protected currentStroke = new commandGroup
    protected visitedPixels = Array<number>()
    protected draw(x: number, y: number, canvas: pixelCanvas): void {
        const p = this.visitedPixels.find(e => e === x + y * canvas.width)
        if (p === undefined && colorWillChange(canvas.getPixel(x, y), this.useColor(canvas))) {
            this.currentStroke.add(new paintPixel(canvas, x, y, this.useColor(canvas)))
            this.visitedPixels.push(x + y * canvas.width)
        }
    }
    protected abstract useColor(canvas: pixelCanvas): color

    start(x: number, y: number, canvas: pixelCanvas): void { this.draw(x, y, canvas) }
    drag(x: number, y: number, canvas: pixelCanvas): void { this.draw(x, y, canvas) }
    finish(canvas: pixelCanvas): command {
        const c = this.currentStroke.copy()
        this.currentStroke.reset()
        this.visitedPixels.length = 0
        return c
    }
}

export class pen_tool extends brush_tool {
    protected useColor(canvas: pixelCanvas): color {
        return canvas.currentColor
    }
}

export class eraser_tool extends brush_tool {
    protected useColor(canvas: pixelCanvas): color {
        return color.white
    }
}

export class eyedropper_tool implements tool {

    private picker: colorPicker
    private onFinish: () => void

    constructor(picker: colorPicker, onFinish: () => void = undefined) {
        this.picker = picker
        this.onFinish = onFinish
    }

    start(x: number, y: number, canvas: pixelCanvas): void {
        this.picker.setColor(canvas.getPixel(x, y))
    }
    drag(x: number, y: number, canvas: pixelCanvas): void {
        this.picker.setColor(canvas.getPixel(x, y))
    }
    finish(canvas: pixelCanvas): void {
        if(this.onFinish) this.onFinish()
    }
}

export class fill_tool implements tool {
    private pixels: commandGroup = new commandGroup
    
    private fill_impl(x: number, y: number, old: color, canvas: pixelCanvas): void {
        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return
        if (!canvas.getPixel(x, y).equals(old)) return
        this.pixels.add(new paintPixel(canvas, x, y, canvas.currentColor))

        this.fill_impl(x - 1, y, old, canvas)
        this.fill_impl(x + 1, y, old, canvas)
        this.fill_impl(x, y - 1, old, canvas)
        this.fill_impl(x, y + 1, old, canvas)
    }

    start(x: number, y: number, canvas: pixelCanvas): void {
        let old = canvas.getPixel(x, y)
        if (!colorWillChange(old, canvas.currentColor)) return
        this.fill_impl(x, y, old, canvas)
    }
    drag(x: number, y: number, canvas: pixelCanvas): void {}
    finish(canvas: pixelCanvas): void | command {
        const p = this.pixels.copy()
        this.pixels.reset()
        return p
    }

}