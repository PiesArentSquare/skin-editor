import { writable } from 'svelte/store'
import { color_store, colors } from './utils/color'
import { skin_section } from './utils/skin'

export const current_color = color_store(colors.red.copy())
export const in_text_field = writable<boolean>(false)
export const alpha_enabled = writable<boolean>(false)
export const current_section = writable<skin_section>(undefined)