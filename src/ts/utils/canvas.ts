import color from './color'
import { skin_section } from './skin'
import type i_tool from './tool'

export default interface i_canvas {
    paint_pixel(x: number, y: number, c: color, overwrite_alpha: boolean): void
    get_pixel(x: number, y:number): color
    current_section: skin_section
    current_tool: i_tool
}