import { writable } from 'svelte/store'
import color, { colors } from './utils/color'

export const current_color = writable<color>(colors.red)
export const in_text_field = writable<boolean>(false)
export const alpha_enabled = writable<boolean>(false)