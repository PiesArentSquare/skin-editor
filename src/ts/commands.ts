import type i_command from './utils/command'
import color from './utils/color'
import canvas_data from './canvas_data'

export class paint_pixel implements i_command {
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