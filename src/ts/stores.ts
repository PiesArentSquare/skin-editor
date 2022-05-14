import { writable } from 'svelte/store'
import color from './utils/color'

export const current_color = writable<color>(color.red)
export const in_text_field = writable<boolean>(false)