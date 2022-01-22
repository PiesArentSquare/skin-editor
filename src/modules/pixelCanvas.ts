import color from "./color.js"

export default class pixelCanvas {
    currentColor: color
    
    private gridWidth: number
    private gridHeight: number
    private pixelSize: number
    private pixels: color[]
    private context: CanvasRenderingContext2D
    private painting: boolean
    
    constructor(htmlSelector: string, width: number, height: number) {
        this.gridWidth = width
        this.gridHeight = height
        this.currentColor = new color(0, 0, 0)
        this.pixels = Array.from(Array<color>(width * height), () => { return new color(255, 255, 255); })

        const canvas = <HTMLCanvasElement>document.querySelector(htmlSelector)
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
            let rect = canvas.getBoundingClientRect()
            let x = e.clientX - rect.left
            let y = e.clientY - rect.top
            this.paintPixel(x, y)
        }

        canvas.addEventListener("mousedown", e => {
            this.painting = true;
            draw(e)
        })
        canvas.addEventListener("mouseup", () => this.painting = false)
        canvas.addEventListener("mousemove", e => {
            if (this.painting) draw(e)
        })
    }

    private repaint() {
        this.pixels.forEach((c, i) => {
            const x = i % this.gridWidth
            const y = Math.floor(i / this.gridWidth)
            this.context.fillStyle = c.to_string()
            this.context.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize)
        })
    }

    private paintPixel(x: number, y: number) {
        this.context.fillStyle = this.currentColor.to_string();
        const xi = Math.floor(x / this.pixelSize)
        const yi = Math.floor(y / this.pixelSize)
        this.context.fillRect(xi * this.pixelSize, yi * this.pixelSize, this.pixelSize, this.pixelSize)
        this.pixels[xi + yi * this.gridWidth] = this.currentColor
    }
}
