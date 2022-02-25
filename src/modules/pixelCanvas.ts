import color from "./color.js"
import { command, commandGroup, undoRedoStack } from "./command.js"

class paintPixel implements command {
    private canvas: pixelCanvas
    private x: number
    private y: number
    private old: color
    private new: color

    constructor(canvas: pixelCanvas, x: number, y: number, value: color) {
        this.canvas = canvas
        this.x = x
        this.y = y
        this.old = canvas.getPixel(x, y)
        this.new = value
    }

    do(): void {
        this.canvas.paintPixel(this.x, this.y, this.new)
    }

    undo(): void {
        this.canvas.paintPixel(this.x, this.y, this.old, true)
    }
}

export default class pixelCanvas {
    
    currentColor: color
    
    private gridWidth: number
    private gridHeight: number
    private pixelSize: number
    
    private pixels: color[]
    private context: CanvasRenderingContext2D
    
    private painting: boolean
    private urStack: undoRedoStack
    private currentStroke: commandGroup
    private visitedPixels: number[]

    constructor(htmlSelector: string, width: number, height: number) {
        this.gridWidth = width
        this.gridHeight = height
        this.currentColor = new color(0, 0, 0)
        this.pixels = Array.from(Array<color>(width * height), () => { return new color(255, 255, 255, 0) })

        this.urStack = new undoRedoStack
        this.currentStroke = new commandGroup
        this.visitedPixels = []

        const canvas = <HTMLCanvasElement>document.querySelector(htmlSelector)
        canvas.style.setProperty("--canvas-width", `${width}`)
        this.context = canvas.getContext("2d")
        
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

        const draw = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect()
            const x = Math.floor((e.clientX - rect.left) / this.pixelSize)
            const y = Math.floor((e.clientY - rect.top) / this.pixelSize)
            const p = this.visitedPixels.find(e => e === x + y * this.gridWidth)
            if (x < this.gridWidth && y < this.gridHeight && p === undefined) {
                this.currentStroke.add(new paintPixel(this, x, y, this.currentColor))
                this.visitedPixels.push(x + y * this.gridWidth)
            }
        }

        canvas.addEventListener("mousedown", e => {
            this.painting = true
            draw(e)
        })
        
        window.addEventListener("mouseup", () => {
            if (this.painting) {
                this.urStack.append(this.currentStroke.copy())
                this.currentStroke.reset()
                this.visitedPixels.length = 0
                this.painting = false
            }
        })

        canvas.addEventListener("mousemove", e => {
            if (this.painting) draw(e)
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
        if (c.a === 1) {
            this.pixels[x + y * this.gridWidth] = c.copy()
            this.context.fillStyle = c.to_string()
            this.context.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize)
        } else {
            if (overwriteAlpha) {
                this.pixels[x + y * this.gridWidth] = c.copy()
                this.repaint()
            } else {
                this.pixels[x + y * this.gridWidth] = c.alpha_blend(this.pixels[x + y * this.gridWidth])
                this.context.fillStyle = c.to_string()
                this.context.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize)
            }
        }
        
    }

    getPixel(x: number, y: number) {
        return this.pixels[x + y * this.gridWidth].copy()
    }

    undo() {
        this.urStack.undo()
    }

    redo() {
        this.urStack.redo()
    }
}
