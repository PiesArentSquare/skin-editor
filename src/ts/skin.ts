import color from "./components/color"

export class skin_section {
    width: number
    height: number
    u: number
    v: number
    pixels:  color[]
    output_canvas: CanvasRenderingContext2D

    constructor(width: number, height: number, u: number, v: number, transparent: boolean, output_canvas: CanvasRenderingContext2D) {
        this.width = width
        this.height = height
        this.u = u
        this.v = v
        this.output_canvas = output_canvas

        this.pixels = transparent ? Array.from(Array<color>(width * height), () => { return color.transparent }) : Array.from(Array<color>(width * height), () => { return color.white })
        this.output_canvas.fillStyle = transparent ? color.transparent.to_string() : color.white.to_string()
        this.output_canvas.fillRect(u, v, width, height)
    }

    paintPixel(x: number, y: number, c: color, blend: boolean = false) {
        this.pixels[x + y * this.width] = blend ? c.alpha_blend(this.pixels[x + y * this.width]) : c.copy()
        this.output_canvas.clearRect(x + this.u, y + this.v, 1, 1)
        this.output_canvas.fillStyle = c.to_string()
        this.output_canvas.fillRect(x + this.u, y + this.v, 1, 1)
    }

}

class limb_layer {
    front: skin_section
    back: skin_section
    right: skin_section
    left: skin_section
    top: skin_section
    bottom: skin_section

    constructor(width: number, height: number, depth: number, u: number, v: number, transparent: boolean, output_canvas: CanvasRenderingContext2D) {
        this.top    = new skin_section(width, depth,  u + depth,             v,         transparent, output_canvas)
        this.bottom = new skin_section(width, depth,  u + depth + width,     v,         transparent, output_canvas)
        this.right  = new skin_section(depth, height, u,                     v + depth, transparent, output_canvas)
        this.front  = new skin_section(width, height, u + depth,             v + depth, transparent, output_canvas)
        this.left   = new skin_section(depth, height, u + depth + width,     v + depth, transparent, output_canvas)
        this.back   = new skin_section(width, height, u + 2 * depth + width, v + depth, transparent, output_canvas)
    }
}

class limb {
    inner: limb_layer
    outer: limb_layer

    constructor(width: number, height: number, depth: number, iu: number, iv: number, ou: number, ov: number, output_canvas: CanvasRenderingContext2D) {
        this.inner = new limb_layer(width, height, depth, iu, iv, false, output_canvas)
        this.outer = new limb_layer(width, height, depth, ou, ov, true, output_canvas)
    }
}

class limb_pair {
    right: limb
    left: limb

    constructor(width: number, height: number, depth: number, riu: number, riv: number, rou: number, rov: number, liu: number, liv: number, lou: number, lov: number, output_canvas: CanvasRenderingContext2D) {
        this.right = new limb(width, height, depth, riu, riv, rou, rov, output_canvas)
        this.left = new limb(width, height, depth, liu, liv, lou, lov, output_canvas)
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
    
    output_canvas: CanvasRenderingContext2D
    imgURL: string | undefined

    constructor(alex: boolean) {
        const output = document.createElement("canvas")
        output.width = 64
        output.height = 64
        this.output_canvas = output.getContext("2d")!

        this.head = new limb(8, 8, 8, skin_uvs.head_iu, skin_uvs.head_iv, skin_uvs.head_ou, skin_uvs.head_ov, this.output_canvas)
        this.body = new limb(8, 12, 4, skin_uvs.body_iu, skin_uvs.body_iv, skin_uvs.body_ou, skin_uvs.body_ov, this.output_canvas)
        this.arms = new limb_pair(alex ? 3 : 4, 12, 4, skin_uvs.rarm_iu, skin_uvs.rarm_iv, skin_uvs.rarm_ou, skin_uvs.rarm_ov, skin_uvs.larm_iu, skin_uvs.larm_iv, skin_uvs.larm_ou, skin_uvs.larm_ov, this.output_canvas)
        this.legs = new limb_pair(4, 12, 4, skin_uvs.rleg_iu, skin_uvs.rleg_iv, skin_uvs.rleg_ou, skin_uvs.rleg_ov, skin_uvs.lleg_iu, skin_uvs.lleg_iv, skin_uvs.lleg_ou, skin_uvs.lleg_ov, this.output_canvas)
    }

    getImageURL(): string { return this.output_canvas.canvas.toDataURL(); }
}