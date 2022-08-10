import type i_command from './command'
import type canvas_data from '../canvas_data'

export default interface i_tool {
    start(x: number, y: number, canvas: canvas_data): void
    drag(x: number, y: number, canvas: canvas_data): void
    finish(canvas: canvas_data): i_command | void
}