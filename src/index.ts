import pixelCanvas, { tool, paintPixel } from "./modules/pixelCanvas.js"
import colorPicker from "./modules/colorPicker.js"
import { command, commandGroup } from "./modules/command.js"
import color from "./modules/color.js"

abstract class brush_tool implements tool {
    protected currentStroke: commandGroup
    protected visitedPixels: number[]
    protected abstract draw(x: number, y: number, canvas: pixelCanvas): void

    constructor() {
        this.currentStroke = new commandGroup
        this.visitedPixels = []
    }

    start(x: number, y: number, canvas: pixelCanvas): void { this.draw(x, y, canvas) }
    drag(x: number, y: number, canvas: pixelCanvas): void { this.draw(x, y, canvas) }
    finish(canvas: pixelCanvas): command {
        const c = this.currentStroke.copy()
        this.currentStroke.reset()
        this.visitedPixels.length = 0
        return c
    }
}

class pen_tool extends brush_tool {
    protected draw(x: number, y: number, canvas: pixelCanvas) {
        const p = this.visitedPixels.find(e => e === x + y * canvas.width)
        if (p === undefined) {
            this.currentStroke.add(new paintPixel(canvas, x, y, canvas.currentColor))
            this.visitedPixels.push(x + y * canvas.width)
        }
    }
}

class eraser_tool extends brush_tool {
    protected draw(x: number, y: number, canvas: pixelCanvas) {
        const p = this.visitedPixels.find(e => e === x + y * canvas.width)
        if (p === undefined) {
            this.currentStroke.add(new paintPixel(canvas, x, y, color.white))
            this.visitedPixels.push(x + y * canvas.width)
        }
    }
}

class eyedropper_tool implements tool {

    private picker: colorPicker
    private onFinish: () => void

    constructor(picker: colorPicker, onFinish: () => void = undefined) {
        this.picker = picker
        this.onFinish = onFinish
    }

    start(x: number, y: number, canvas: pixelCanvas): void {
        this.picker.setColor(canvas.getPixel(x, y).copy())
    }
    drag(x: number, y: number, canvas: pixelCanvas): void {
        this.picker.setColor(canvas.getPixel(x, y).copy())
    }
    finish(canvas: pixelCanvas): void {
        if(this.onFinish) this.onFinish()
    }
}

class toolbar {
    private parent: HTMLElement
    private canvas: pixelCanvas
    private ids: Map<string, number>
    private keybinds: Map<string, number>
    private values: tool[]

    constructor(parentSelector: string, canvas: pixelCanvas) {
        this.ids = new Map<string, number>()
        this.keybinds = new Map<string, number>()
        this.values = []
        this.canvas = canvas
        this.parent = document.querySelector(parentSelector)

        this.parent.childNodes.forEach((c, i) => {
            c.addEventListener("click", () => {
                let id = (<HTMLElement>c).id
                if (id !== "") this.setActiveFromId(id)
            })
        })
    }

    register(id: string, keybind: string, value: tool) {
        this.ids.set(id, this.values.length)
        this.keybinds.set(keybind, this.values.length)
        this.values.push(value)
    }

    getFromId(id: string) { return this.values[this.ids.get(id)]}
    getFromKeybind(keybind: string) { return this.values[this.keybinds.get(keybind)]}

    setActiveFromId(id: string) {
        this.canvas.currentTool = this.getFromId(id);
        (<HTMLInputElement>document.getElementById(id)).checked = true
    }

    setActiveFromKeybind(keybind: string) {
        this.canvas.currentTool = this.getFromKeybind(keybind)
        const index = this.keybinds.get(keybind)
        for (let [id, i] of this.ids.entries()) {
            if (index === i)
                (<HTMLInputElement>document.getElementById(id)).checked = true
        }
    }
}

window.addEventListener("load", () => {
    const canvas = new pixelCanvas("#canvas", 8, 8)
    const picker = new colorPicker("#color-picker", c => canvas.currentColor = c.copy())
    
    const tools = new toolbar(".tools", canvas)
    tools.register("pen", "KeyB", new pen_tool)
    tools.register("eraser", "KeyE", new eraser_tool)
    tools.register("eyedropper", "KeyI", new eyedropper_tool(picker, () => {
        tools.setActiveFromId("pen")
    }))

    tools.setActiveFromId("pen")

    let alphaEnabled = false

    window.addEventListener("keydown", e => {
        if (e.code === "KeyZ" && e.ctrlKey) {
            if (e.shiftKey) canvas.redo()
            else canvas.undo()
        }
        else if (e.code === "KeyX") {
            alphaEnabled = !alphaEnabled
            picker.alphaEnabled = alphaEnabled
        }
        else if (tools.getFromKeybind(e.code) !== undefined)
            tools.setActiveFromKeybind(e.code)
    })
})
