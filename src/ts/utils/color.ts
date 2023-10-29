export default class color {
    r: number
    g: number
    b: number
    a: number

    private constructor(r: number, g: number, b: number, a: number) {
        this.r = r
        this.g = g
        this.b = b
        this.a = a
    }

    static rgb(r: number, g: number, b: number, a: number = 255): color {
        return new color(Math.round(r), Math.round(g), Math.round(b), Math.round(a))
    }

    static hsv_to_rgb(h: number, s: number, v: number) {
        h = h % 360
        s = s / 100
        v = v / 100

        const c = v * s
        const x = c * (1 - Math.abs((h / 60) % 2 - 1))
        const m = v - c

        let r: number, g: number, b: number
        if (h < 60) {
            r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else {
            r = c; g = 0; b = x;
        }

        return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
    }

    set_hsv(h: number, s: number, v: number, a: number = 255) {
        [this.r, this.g, this.b] = color.hsv_to_rgb(h, s, v)
        this.a = a
        return this
    }

    static hsv(h: number, s: number, v: number, a: number = 255) {
        return new color(0, 0, 0, 0).set_hsv(h, s, v, a)
    }

    static hex_to_rgb(hex: string) {
        if (hex[0] === '#') hex = hex.substring(1)
        if (hex.length !== 6 && hex.length !== 8) throw 'hex code invalid length'

        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        const a = hex.length === 6 ? 255 : parseInt(hex.substring(6, 8), 16)

        if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) throw 'invalid hex code'
        return [r, g, b, a]
    }

    set_hex(hex: string) {
        [this.r, this.g, this.b, this.a] = color.hex_to_rgb(hex)
        return this
    }

    static hex(hex: string) {
        return new color(0, 0, 0, 0).set_hex(hex)
    }

    to_hsv(): [number, number, number, number] {
        const r = this.r / 255
        const g = this.g / 255
        const b = this.b / 255

        const cmax = Math.max(r, g, b)
        const cmin = Math.min(r, g, b)
        const delta = cmax - cmin

        let h: number
        if (delta === 0)
            h = 0
        else if (cmax === r)
            h = 60 * (((g - b) / delta + 6) % 6)
        else if (cmax === g)
            h = 60 * (((b - r) / delta) + 2)
        else
            h = 60 * (((r - g) / delta) + 4)

        const s = cmax ? delta / cmax * 100 : 0
        const v = cmax * 100

        return [h, s, v, this.a]
    }

    to_hex(): string {
        const rgba = [this.r, this.g, this.b, this.a]
            .map(n => n.toString(16))
            .map(c => c.length === 1 ? '0' + c : c)
            .join('')
        return '#' + rgba
    }

    to_string(): string {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a / 255})`
    }

    full_alpha_string(): string {
        return `rgba(${this.r}, ${this.g}, ${this.b}, 1)`
    }

    equals(rhs: color): boolean {
        return this.r === rhs.r &&
            this.g === rhs.g &&
            this.b === rhs.b &&
            this.a === rhs.a
    }

    copy(): color {
        return new color(this.r, this.g, this.b, this.a)
    }

}

export const colors = {
    red: color.rgb(255, 0, 0),
    white: color.rgb(255, 255, 255),
    black: color.rgb(0, 0, 0),
    transparent: color.rgb(0, 0, 0, 0)
}

enum subscribe_type {
    hex = 1,
    hsv = 2,
    all = hex | hsv
}

type subscriber = [subscribe_type, (c: color) => void]

export function color_store(value: color) {
    let subscribers = new Set<subscriber>();

    function set(new_value: color) {
        if (!new_value.equals(value)) {
            value = new_value
            for (const sub of subscribers)
                sub[1](value)
        }
    }

    function set_hsva(h: number, s: number, v: number, a: number) {
        const new_value = color.hsv(h, s, v, a)
        if (!new_value.equals(value)) {
            value = new_value
            for (const sub of subscribers) {
                if (sub[0] & subscribe_type.hsv)
                    sub[1](value)
            }
        }
    }

    function set_hex(hex: string) {
        const new_value = color.hex(hex)
        if (!new_value.equals(value)) {
            value = new_value
            for (const sub of subscribers) {
                if (sub[0] & subscribe_type.hsv)
                    sub[1](value)
            }
        }
    }

    function subscribe(run: (c: color) => void) {
        const sub: subscriber = [subscribe_type.all, run]
        subscribers.add(sub)
        run(value)
        return () => subscribers.delete(sub)
    }

    function subscribe_hsva(run: (h: number, s: number, v: number, a: number) => void) {
        const r = (c: color) => {
            const [h, s, v, a] = value.to_hsv()
            run(h, s, v, a)
        }
        const sub: subscriber = [subscribe_type.hsv, r]
        subscribers.add(sub)
        r(value)
        return () => subscribers.delete(sub)
    }

    function subscribe_hex(run: (hex: string) => void) {
        const r = (c: color) => run(value.to_hex())
        const sub: subscriber = [subscribe_type.hex, r]
        subscribers.add(sub)
        r(value)
        return () => subscribers.delete(sub)
    }

    return { subscribe, subscribe_hex, subscribe_hsva, set, set_hex, set_hsva }
}