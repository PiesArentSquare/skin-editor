// h in [0, 360); s, v, a in [0, 100]
export default class color {
    private hue: number
    get h(): number { return this.hue }
    set h(v: number) { this.hue = v % 360 }
    s: number
    v: number
    a: number

    constructor(hue: number, saturation: number, value: number, alpha: number = 100) {
        this.h = hue
        this.s = saturation
        this.v = value
        this.a = alpha
    }

    // h in [0, 360); s, l, a in [0, 100]
    to_hsla(): [h: number, s: number, l: number, a: number] {
        const l = this.v * (1 - this.s / 200)
        const m = Math.min(l, 100 - l)
        const s = m ? 100 * (this.v - l) / m : 0
        return [this.h, s, l, this.a]
    }

    // r, g, b in [0, 255], a in [0, 100]
    to_rgba(): [r: number, g: number, b: number, a: number] {
        const s = this.s / 100
        const v = this.v / 100
        const c = v * s
        const x = c * (1 - Math.abs((this.h / 60) % 2 - 1))
        const m = v - c

        let r: number, g: number, b: number
        if (this.h < 60) {
            r = c; g = x; b = 0
        } if (60 <= this.h && this.h < 120) {
            r = x; g = c; b = 0
        } else if (120 <= this.h && this.h < 180) {
            r = 0; g = c; b = x
        } else if (180 <= this.h && this.h < 240) {
            r = 0; g = x; b = c
        } else if (240 <= this.h && this.h < 300) {
            r = x; g = 0; b = c
        } else if (300 <= this.h && this.h < 360) {
            r = c; g = 0; b = x
        }

        r = Math.round((r + m) * 255)
        g = Math.round((g + m) * 255)
        b = Math.round((b + m) * 255)

        return [r, g, b, this.a]
    }

    to_hex(): string {
        const [r, g, b, a] = this.to_rgba()
        const rgba = [
            r.toString(16),
            g.toString(16),
            b.toString(16),
            (Math.floor(a * 255 / 100)).toString(16)
        ]
        rgba.forEach((c, i) => {
            if (c.length === 1) rgba[i] = "0" + c
        })
        return "#" + rgba[0] + rgba[1] + rgba[2] + (a === 100 ? "" : rgba[3])
    }

    // r, g, b in [0, 255], a in [0, 100]
    static from_rgba(r: number, g: number, b: number, a: number = 100): color {
        r = r / 255
        g = g / 255
        b = b / 255

        const cmax = Math.max(r, g, b)
        const cmin = Math.min(r, g, b)
        const delta = cmax - cmin

        let h: number
        if (delta === 0)     h = 0
        else if (cmax === r) h = 60 * (((g - b) / delta + 6) % 6)
        else if (cmax === g) h = 60 * (((b - r) / delta) + 2)
        else                 h = 60 * (((r - g) / delta) + 4)

        const s = cmax ? delta / cmax * 100 : 0
        const v = cmax * 100

        return new color(h, s, v, a)
    }

    static from_hex(hex: string): color {
        if (hex[0] === '#') hex = hex.substring(1)
        if (!(hex.length === 6 || hex.length === 8)) throw 'hex is the wrong length'

        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        let a = 100
        if (hex.length > 6) a = parseInt(hex.substring(6, 8), 16) / 255 * 100
        if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) throw 'invalid hex code'

        return color.from_rgba(r, g, b, a)
    }

    to_string(): string {
        const [h, s, l, a] = this.to_hsla()
        return `hsla(${h}, ${s}%, ${l}%, ${a / 100})`
    }

    equals(rhs: color): boolean {
        return rhs.h === this.h && rhs.s === this.s && rhs.v === this.v && rhs.a === this.a
    }

    copy(): color {
        return new color(this.h, this.s, this.v, this.a)
    }

    full_alpha(): color {
        return new color(this.h, this.s, this.v, 100)
    }
}

export const colors = {
    red: new color(0, 100, 100),
    white: new color(0, 0, 100),
    black: new color(0, 0, 0),
    transparent: new color(0, 0, 100, 0)
}