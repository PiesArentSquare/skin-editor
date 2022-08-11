import color, { colors } from './color'

export class skin_section {
    width: number
    height: number
    u: number
    v: number
    pixels:  color[]
    output_canvas: CanvasRenderingContext2D
    subsection_canvas: CanvasRenderingContext2D
    alpha_enabled: boolean
    private on_update: () => void

    constructor(width: number, height: number, u: number, v: number, transparent: boolean, output_canvas: CanvasRenderingContext2D, on_update: () => void, outer = false) {
        this.width = width
        this.height = height
        this.u = u
        this.v = v
        this.output_canvas = output_canvas
        this.alpha_enabled = outer
        this.on_update = on_update

        const subsection = document.createElement("canvas")
        subsection.width = width
        subsection.height = height
        this.subsection_canvas = subsection.getContext("2d")

        this.pixels = transparent ? Array.from(Array<color>(width * height), () => { return colors.transparent }) : Array.from(Array<color>(width * height), () => { return colors.white })
        const fill_color = transparent ? colors.transparent.to_string() : colors.white.to_string()
        this.output_canvas.fillStyle = fill_color
        this.output_canvas.fillRect(u, v, width, height)
        this.subsection_canvas.fillStyle = fill_color
        this.subsection_canvas.fillRect(0, 0, width, height)
    }

    paint_pixel(x: number, y: number, c: color, blend: boolean = false) {
        this.pixels[x + y * this.width] = blend ? c.alpha_blend(this.pixels[x + y * this.width]) : c.copy()
        const fill_color = this.pixels[x + y * this.width].to_string()
        this.output_canvas.fillStyle = fill_color
        this.output_canvas.clearRect(x + this.u, y + this.v, 1, 1)
        this.output_canvas.fillRect(x + this.u, y + this.v, 1, 1)
        this.subsection_canvas.fillStyle = fill_color
        this.subsection_canvas.clearRect(x, y, 1, 1)
        this.subsection_canvas.fillRect(x, y, 1, 1)
        this.on_update()
    }

    get_subsection_url() { return this.subsection_canvas.canvas.toDataURL() }

}

class limb_layer {
    front: skin_section
    back: skin_section
    right: skin_section
    left: skin_section
    top: skin_section
    bottom: skin_section

    constructor(width: number, height: number, depth: number, u: number, v: number, transparent: boolean, output_canvas: CanvasRenderingContext2D, on_update: () => void, outer = false) {
        this.top    = new skin_section(width, depth,  u + depth,             v,         transparent, output_canvas, on_update, outer)
        this.bottom = new skin_section(width, depth,  u + depth + width,     v,         transparent, output_canvas, on_update, outer)
        this.right  = new skin_section(depth, height, u,                     v + depth, transparent, output_canvas, on_update, outer)
        this.front  = new skin_section(width, height, u + depth,             v + depth, transparent, output_canvas, on_update, outer)
        this.left   = new skin_section(depth, height, u + depth + width,     v + depth, transparent, output_canvas, on_update, outer)
        this.back   = new skin_section(width, height, u + 2 * depth + width, v + depth, transparent, output_canvas, on_update, outer)
    }

    sections() { return [
        {section: this.top, name: 'top'},
        {section: this.right, name: 'right'},
        {section: this.front, name: 'front'},
        {section: this.left, name: 'left'},
        {section: this.back, name: 'back'},
        {section: this.bottom, name: 'bottom'}
    ]}
}

class limb {
    inner: limb_layer
    outer: limb_layer

    constructor(width: number, height: number, depth: number, iu: number, iv: number, ou: number, ov: number, output_canvas: CanvasRenderingContext2D, on_update: () => void) {
        this.inner = new limb_layer(width, height, depth, iu, iv, false, output_canvas, on_update)
        this.outer = new limb_layer(width, height, depth, ou, ov, true, output_canvas, on_update, true)
    }

    layers() { return [
        {layer: this.inner, name: 'inner'},
        {layer: this.outer, name: 'outer'}
    ]}
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

export default class skin {
    head: limb
    body: limb
    arms: limb_pair
    legs: limb_pair
    alex: boolean
    private subscribers: (() => void)[]
    
    output_canvas: CanvasRenderingContext2D

    constructor(alex: boolean) {
        this.alex = alex
        const output = document.createElement("canvas")
        output.width = 64
        output.height = 64
        this.output_canvas = output.getContext("2d")!
        this.subscribers = []

        this.head = new limb(8, 8, 8, skin_uvs.head_iu, skin_uvs.head_iv, skin_uvs.head_ou, skin_uvs.head_ov, this.output_canvas, this.on_update.bind(this))
        this.body = new limb(8, 12, 4, skin_uvs.body_iu, skin_uvs.body_iv, skin_uvs.body_ou, skin_uvs.body_ov, this.output_canvas, this.on_update.bind(this))
        this.arms = new limb_pair(alex ? 3 : 4, 12, 4, skin_uvs.rarm_iu, skin_uvs.rarm_iv, skin_uvs.rarm_ou, skin_uvs.rarm_ov, skin_uvs.larm_iu, skin_uvs.larm_iv, skin_uvs.larm_ou, skin_uvs.larm_ov, this.output_canvas, this.on_update.bind(this))
        this.legs = new limb_pair(4, 12, 4, skin_uvs.rleg_iu, skin_uvs.rleg_iv, skin_uvs.rleg_ou, skin_uvs.rleg_ov, skin_uvs.lleg_iu, skin_uvs.lleg_iv, skin_uvs.lleg_ou, skin_uvs.lleg_ov, this.output_canvas, this.on_update.bind(this))
    }

    limbs() { return [
        {limb: this.head, name: 'head'},
        {limb: this.body, name: 'body'},
        {limb: this.arms.right, name: 'right arm'},
        {limb: this.arms.left, name: 'left arm'},
        {limb: this.legs.right, name: 'right leg'},
        {limb: this.legs.left, name: 'left leg'}
    ]}

    get_image_url(): string { return this.output_canvas.canvas.toDataURL(); }

    subscribe(callback: () => void) {
        this.subscribers.push(callback)
    }

    private on_update() {
        this.subscribers.forEach(s => s())
    }
}