import color from './color'
import type i_tool from './tool'

export default interface i_canvas {
    paint_pixel(x: number, y: number, c: color, overwrite_alpha: boolean): void
    get_pixel(x: number, y:number): color
    undo(): void
    redo(): void
    current_tool: i_tool
}