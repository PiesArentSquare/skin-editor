export default class color {
    r: number
    g: number
    b: number
    a: number
    
    constructor(r: number, g: number, b: number, a = 1) {
        this.r = r
        this.g = g
        this.b = b
        this.a = a
    }

    private static from_hcxm(h:number, c: number, x:number, m: number, a: number): color {
        let r: number, g: number, b: number
        
        if (0 <= h && h < 60) {
            r = c; g = x; b = 0;  
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x;
        }

        r = Math.round((r + m) * 255)
        g = Math.round((g + m) * 255)
        b = Math.round((b + m) * 255)

        return new color(r, g, b, a)
    }

    // s and v are between 0 and 1
    static from_hsv(h: number, s: number, v: number, a = 1): color {
        h = h % 360
        const c = v * s
        const x = c * (1 - Math.abs((h / 60) % 2 - 1))
        const m = v - c
        return this.from_hcxm(h, c, x, m, a)
    }

    // s and v are between 0 and 1
    static from_hsl(h: number, s: number, l: number, a = 1): color {
        h = h % 360
        const c = (1 - Math.abs(2 * l -1)) * s
        const x = c * (1 - Math.abs((h / 60) % 2 - 1))
        const m = 1 - c / 2
        return this.from_hcxm(h, c, x, m, a)
    }

    static from_hex(hex: string): color | undefined {
        if (hex[0] === "#") hex = hex.substring(1)
        if (!(hex.length === 6 || hex.length === 8)) return undefined
        
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        let a = 1
        if (hex.length > 6) a = parseInt(hex.substring(6, 8), 16) / 255
        if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) return undefined

        return new color(r, g, b, a)
    }
    
    to_string(): string {
        return `rgba(${this.r},${this.g},${this.b},${this.a})`
    }

    to_hex(): string {
        const rgba = [
            this.r.toString(16),
            this.g.toString(16),
            this.b.toString(16),
            (this.a * 255).toString(16)
        ]
        rgba.forEach((c, i) => {
            if (c.length === 1) rgba[i] = "0" + c
        })
        return "#" + rgba[0] + rgba[1] + rgba[2] + (this.a === 1 ? "" : rgba[3])
    }

    to_hsv(): [h: number, s: number, v: number, a: number] {
        const r = this.r / 255
        const g = this.g / 255
        const b = this.b / 255

        const cmax = Math.max(r, g, b)
        const cmin = Math.min(r, g, b)
        const delta = cmax - cmin
        let h:number, s:number
        const v = cmax

        if (delta === 0) h = 0
        else if (cmax === r) h = 60 * (((g - b + 6) / delta) % 6)
        else if (cmax === g) h = 60 * (((b - r) / delta) + 2)
        else                 h = 60 * (((r - g) / delta) + 4)

        if (cmax === 0) s = 0
        else s = delta / cmax

        return [h, s, v, this.a]
    }
}