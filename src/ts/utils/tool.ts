import type i_command from './command'
import type i_canvas from './canvas'

export default interface i_tool {
    start(x: number, y: number, canvas: i_canvas): void
    drag(x: number, y: number, canvas: i_canvas): void
    finish(canvas: i_canvas): i_command | void
}