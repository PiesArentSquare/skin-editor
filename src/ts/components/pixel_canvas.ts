import color from "./color.js"
import { command, commandGroup, undoRedoStack } from "./command.js"

export class paintPixel implements command {
    private canvas: pixelCanvas
    private x: number
    private y: number
    private old: color
    private new: color
    private overwriteAlpha: boolean

    constructor(canvas: pixelCanvas, x: number, y: number, value: color, overwriteAlpha: boolean = false) {
        this.canvas = canvas
        this.x = x
        this.y = y
        this.old = canvas.getPixel(x, y).copy()
        this.new = value
        this.overwriteAlpha = overwriteAlpha
    }

    do(): void {
        this.canvas.paintPixel(this.x, this.y, this.new, this.overwriteAlpha)
    }

    undo(): void {
        this.canvas.paintPixel(this.x, this.y, this.old, true)
    }
}

export interface tool {
    start(x: number, y: number, canvas: pixelCanvas): void
    drag(x: number, y: number, canvas: pixelCanvas): void
    finish(canvas: pixelCanvas): command | void
}

export default class pixelCanvas {
    
    currentColor: color
    
    private gridWidth: number
    private gridHeight: number
    private pixelSize: number = 0
    
    private pixels: color[]
    private context: CanvasRenderingContext2D
    private output_canvas: CanvasRenderingContext2D
    
    private painting: boolean = false
    private urStack: undoRedoStack
    currentTool: tool | undefined

    constructor(htmlSelector: string, width: number, height: number) {
        this.gridWidth = width
        this.gridHeight = height
        this.currentColor = new color(0, 0, 0)
        this.pixels = Array.from(Array<color>(width * height), () => { return new color(255, 255, 255, 0) })

        this.urStack = new undoRedoStack

        const canvas = <HTMLCanvasElement>document.querySelector(htmlSelector)
        canvas.style.setProperty("--canvas-width", `${width}`)
        this.context = canvas.getContext("2d")!

        const output = document.createElement("canvas")
        output.width = width
        output.height = height
        this.output_canvas = output.getContext("2d")!
        
        const defaultCSSWidth = canvas.style.width
        const resizeCallback = () => {
            // reset the canvas width to the original style so it can recalulate
            canvas.style.width = defaultCSSWidth
            // set the canvas pixel-perfect width nearest to the css-calculated width
            const pixelPerfectWidth = (canvas.clientWidth - canvas.clientWidth % this.gridWidth)
            canvas.width = pixelPerfectWidth
            canvas.height = pixelPerfectWidth * height / width
            // set the css width to that calculated value
            canvas.style.width = `${canvas.width}px`
            this.pixelSize = canvas.width / this.gridWidth

            this.repaint()
        }
        resizeCallback()
        window.addEventListener("resize", resizeCallback)

        const useTool = (e: MouseEvent, start: boolean = false): void => {
            const rect = canvas.getBoundingClientRect()
            const x = Math.floor((e.clientX - rect.left) / this.pixelSize)
            const y = Math.floor((e.clientY - rect.top) / this.pixelSize)
            if (x < this.gridWidth && y < this.gridHeight) {
                if (start) this.currentTool?.start(x, y, this)
                else this.currentTool?.drag(x, y, this)
            }
        }

        const finishPainting = () => {
            const c = this.currentTool?.finish(this)
            if (c && !(<commandGroup>c).is_empty()) this.urStack.append(c)
            this.painting = false
        }

        canvas.addEventListener("mousedown", e => {
            if (e.button === 0) {
                this.painting = true
                useTool(e, true)
            } else if (this.painting)
                finishPainting()
        })
        
        window.addEventListener("mouseup", () => {
            if (this.painting) finishPainting()
        })

        canvas.addEventListener("mousemove", e => {
            if (this.painting) useTool(e)
        })
    }

    private repaint() {
        this.context.clearRect(0, 0, this.gridWidth * this.pixelSize, this.gridHeight * this.pixelSize)
        this.pixels.forEach((c, i) => {
            const x = i % this.gridWidth
            const y = Math.floor(i / this.gridWidth)
            this.context.fillStyle = c.to_string()
            this.context.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize)
        })
    }

    paintPixel(x: number, y: number, c: color, overwriteAlpha = false) {
        if (c.a === 1 || overwriteAlpha) {
            this.pixels[x + y * this.gridWidth] = c.copy()
            this.context.clearRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize)
        } else
            this.pixels[x + y * this.gridWidth] = c.alpha_blend(this.pixels[x + y * this.gridWidth])
        
        this.context.fillStyle = c.to_string()
        this.context.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize)
    }

    generateImageURL(): string {
        this.pixels.forEach((c, i) => {
            const x = i % this.gridWidth
            const y = Math.floor(i / this.gridWidth)
            this.output_canvas.fillStyle = c.to_string()
            this.output_canvas.fillRect(x, y, 1, 1)
        })
        return this.output_canvas.canvas.toDataURL();
    }

    getPixel(x: number, y: number) { return this.pixels[x + y * this.gridWidth] }
    get width() { return this.gridWidth; }
    get height() { return this.gridHeight; }
    undo() { this.urStack.undo() }
    redo() { this.urStack.redo() }
}
