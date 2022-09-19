import color, { colors } from './color'
import { alpha_enabled } from '../stores'
import { current_section } from '../stores'

export class skin_section {
    width: number
    height: number
    u: number
    v: number
    pixel_cache:  color[]
    output_canvas: CanvasRenderingContext2D
    subsection_canvas: CanvasRenderingContext2D
    alpha_enabled: boolean
    private on_update: () => void

    constructor(width: number, height: number, u: number, v: number, output_canvas: CanvasRenderingContext2D, on_update: () => void, transparent = false) {
        this.width = width
        this.height = height
        this.u = u
        this.v = v
        this.output_canvas = output_canvas
        this.alpha_enabled = transparent
        this.on_update = on_update

        const subsection = document.createElement('canvas')
        subsection.width = width
        subsection.height = height
        this.subsection_canvas = subsection.getContext('2d')

        this.clear()
    }

    paint_pixel(x: number, y: number, c: color, overwrite_alpha: boolean = false) {
        this.output_canvas.fillStyle = c.to_string()
        if (overwrite_alpha)
            this.output_canvas.clearRect(x + this.u, y + this.v, 1, 1)
        this.output_canvas.fillRect(x + this.u, y + this.v, 1, 1)

        if (!overwrite_alpha && c.a !== 100) {
            const rgba = this.output_canvas.getImageData(x + this.u, y + this.v, 1, 1).data
            this.pixel_cache[x + y * this.width] = color.from_rgba(rgba[0], rgba[1], rgba[2], rgba[3] * 100 / 255)
        } else {
            this.pixel_cache[x + y * this.width] = c.copy()
        }
        this.on_update()
    }

    get_subsection_url() {
        const subsection = this.output_canvas.getImageData(this.u, this.v, this.width, this.height)
        this.subsection_canvas.putImageData(subsection, 0, 0)
        return this.subsection_canvas.canvas.toDataURL()
    }

    get_pixel(x: number, y: number) {
        return this.pixel_cache[x + y * this.width]
    }

    load(canvas: HTMLCanvasElement) {
        canvas.width = this.width
        canvas.height = this.height
        let subsection = this.output_canvas.getImageData(this.u, this.v, this.width, this.height)
        canvas.getContext('2d').putImageData(subsection, 0, 0)
        
        alpha_enabled.set(this.alpha_enabled)
    }

    clear() {
        this.pixel_cache = Array.from(Array<color>(this.width * this.height), () => { return this.alpha_enabled ? colors.transparent : colors.white })
        this.output_canvas.fillStyle = this.alpha_enabled ? colors.transparent.to_string() : colors.white.to_string()
        this.output_canvas.fillRect(this.u, this.v, this.width, this.height)
    }

    recache() {
        const data = this.output_canvas.getImageData(this.u, this.v, this.width, this.height).data
        this.pixel_cache = []
        for (let x = 0; x < this.width; x++)
            for (let y = 0; y < this.height; y++) {
                this.pixel_cache[x + y * this.width] = color.from_rgba(
                    data[(x + y * this.width) * 4],
                    data[(x + y * this.width) * 4 + 1],
                    data[(x + y * this.width) * 4 + 2],
                    data[(x + y * this.width) * 4 + 3]
                )
            }
    }
}

class limb_layer {
    top: skin_section
    right: skin_section
    front: skin_section
    left: skin_section
    back: skin_section
    bottom: skin_section

    constructor(width: number, height: number, depth: number, u: number, v: number, output_canvas: CanvasRenderingContext2D, on_update: () => void, transparent = false) {
        this.top    = new skin_section(width, depth,  u + depth,             v,         output_canvas, on_update, transparent)
        this.bottom = new skin_section(width, depth,  u + depth + width,     v,         output_canvas, on_update, transparent)
        this.right  = new skin_section(depth, height, u,                     v + depth, output_canvas, on_update, transparent)
        this.front  = new skin_section(width, height, u + depth,             v + depth, output_canvas, on_update, transparent)
        this.left   = new skin_section(depth, height, u + depth + width,     v + depth, output_canvas, on_update, transparent)
        this.back   = new skin_section(width, height, u + 2 * depth + width, v + depth, output_canvas, on_update, transparent)
    }

    set_width(width: number) {
        const delta_width = width - this.top.width
        this.top.width = width

        this.bottom.width = width
        this.bottom.u += delta_width

        this.left.u += delta_width

        this.front.width = width

        this.back.width = width
        this.back.u += delta_width
    }
}

class limb {
    inner: limb_layer
    outer: limb_layer

    constructor(width: number, height: number, depth: number, iu: number, iv: number, ou: number, ov: number, output_canvas: CanvasRenderingContext2D, on_update: () => void) {
        this.inner = new limb_layer(width, height, depth, iu, iv, output_canvas, on_update)
        this.outer = new limb_layer(width, height, depth, ou, ov, output_canvas, on_update, true)
    }

    set_width(width: number) {
        this.inner.set_width(width)
        this.outer.set_width(width)
    }
}

class limb_pair {
    right: limb
    left: limb

    constructor(width: number, height: number, depth: number, riu: number, riv: number, rou: number, rov: number, liu: number, liv: number, lou: number, lov: number, output_canvas: CanvasRenderingContext2D, on_update: () => void) {
        this.right = new limb(width, height, depth, riu, riv, rou, rov, output_canvas, on_update)
        this.left = new limb(width, height, depth, liu, liv, lou, lov, output_canvas, on_update)
    }
}

const skin_uvs = {
    head_iu: 0,  head_iv: 0,
    head_ou: 32, head_ov: 0,
    body_iu: 16, body_iv: 16,
    body_ou: 16, body_ov: 32,
    rarm_iu: 40, rarm_iv: 16,
    rarm_ou: 40, rarm_ov: 32,
    larm_iu: 32, larm_iv: 48,
    larm_ou: 48, larm_ov: 48,
    rleg_iu: 0,  rleg_iv: 16,
    rleg_ou: 0,  rleg_ov: 32,
    lleg_iu: 16, lleg_iv: 48,
    lleg_ou: 0,  lleg_ov: 48,
}

let section: skin_section
current_section.subscribe(value => section = value)

const reader = new FileReader()

export default class skin {
    head: limb
    body: limb
    arms: limb_pair
    legs: limb_pair
    private alex: boolean
    private subscribers: (() => void)[]
    
    output_canvas: CanvasRenderingContext2D

    constructor(slim: boolean = false) {
        this.alex = slim
        const output = document.createElement("canvas")
        output.width = 64
        output.height = 64
        this.output_canvas = output.getContext("2d")
        this.subscribers = []

        this.head = new limb(8, 8, 8, skin_uvs.head_iu, skin_uvs.head_iv, skin_uvs.head_ou, skin_uvs.head_ov, this.output_canvas, this.on_update.bind(this))
        this.body = new limb(8, 12, 4, skin_uvs.body_iu, skin_uvs.body_iv, skin_uvs.body_ou, skin_uvs.body_ov, this.output_canvas, this.on_update.bind(this))
        this.arms = new limb_pair(slim ? 3 : 4, 12, 4, skin_uvs.rarm_iu, skin_uvs.rarm_iv, skin_uvs.rarm_ou, skin_uvs.rarm_ov, skin_uvs.larm_iu, skin_uvs.larm_iv, skin_uvs.larm_ou, skin_uvs.larm_ov, this.output_canvas, this.on_update.bind(this))
        this.legs = new limb_pair(4, 12, 4, skin_uvs.rleg_iu, skin_uvs.rleg_iv, skin_uvs.rleg_ou, skin_uvs.rleg_ov, skin_uvs.lleg_iu, skin_uvs.lleg_iv, skin_uvs.lleg_ou, skin_uvs.lleg_ov, this.output_canvas, this.on_update.bind(this))

        reader.addEventListener('load', e => {
            const img = new Image()
            img.addEventListener('load', () => {
                this.output_canvas.clearRect(0, 0, 64, 64)
                this.output_canvas.drawImage(img, 0, 0)

                current_section.set(section)
                this.on_update()
                for (const [_, limb] of Object.entries(this.limbs()))
                    for (const layer of [limb.inner, limb.outer])
                        for (const [_, section] of Object.entries(layer))
                            (<skin_section>section).recache()
            })
            img.src = <string>e.target.result
        })
    }

    limbs() { return {
        head: this.head,
        body: this.body,
        'right arm': this.arms.right,
        'left arm': this.arms.left,
        'right leg': this.legs.right,
        'left leg': this.legs.left
    }}

    get_image_url(): string { return this.output_canvas.canvas.toDataURL(); }

    subscribe(callback: () => void) {
        this.subscribers.push(callback)
    }

    load(alex: boolean, file: File | void) {
        this.alex = alex
        this.arms.left.set_width(alex ? 3 : 4)
        this.arms.right.set_width(alex ? 3 : 4)
        if (file)
            reader.readAsDataURL(file)
        else {
            this.output_canvas.clearRect(0, 0, 64, 64)
            this.each_section(s => s.clear())
            current_section.set(section)
            this.on_update()
        }
    }

    private each_section(func: (s: skin_section) => void) {
        for (const [_, limb] of Object.entries(this.limbs()))
            for (const layer of [limb.inner, limb.outer])
                for (const [_, section] of Object.entries(layer))
                    func(section)
    }

    get slim() { return this.alex }

    private on_update() {
        this.subscribers.forEach(s => s())
    }
}