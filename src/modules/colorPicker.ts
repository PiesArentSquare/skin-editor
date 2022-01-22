import color from "./color.js"

interface attributeList {
    [key: string]: string
}

const addChild = (tag: string, parent: HTMLElement, attributes: attributeList = {}): HTMLElement => {
    const e = document.createElement(tag)
    parent.appendChild(e)
    for (const a in attributes)
        e.setAttribute(a, attributes[a])
    return e
}

const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

class verticalSlider {
    value: number

    private slider: HTMLDivElement
    private handle: HTMLDivElement
    private updateCallback: () => void

    private setHandle(y: number) {
        const rect = this.slider.getBoundingClientRect()
        y = clamp(y, rect.top, rect.bottom)
        const oy = y - rect.top
        this.handle.style.top = `${oy}px`

        this.value = oy / rect.height
        this.updateCallback()
    }

    constructor(name: string, parent: HTMLElement, updateCallback: () => void) {
        this.slider = <HTMLDivElement>addChild("div", parent, {class: `${name}-slider slider`})
        this.handle = <HTMLDivElement>addChild("div", this.slider, {class: `${name}-handle handle`})
        this.updateCallback = updateCallback

        let dragging = false
        this.slider.addEventListener("mousedown", e => {
            dragging = true
            this.setHandle(e.clientY)
        })
        window.addEventListener("mouseup", () => dragging = false)
        window.addEventListener("mousemove", e => {
            if (dragging)
                this.setHandle(e.clientY)
        })
    }

    setHandleColor(color: color) {
        this.handle.style.color = color.to_string()
    }

    setNormalizedHandlePosition(v: number) {
        const rect = this.slider.getBoundingClientRect()
        v *= rect.height
        this.handle.style.top = `${v}px`
    }
}



export default class colorPicker {

    currentColor: color

    private parent: HTMLElement
    private pickerWindow: HTMLDivElement
    private defaultCSSDisplay: string
    private slPicker: HTMLDivElement
    private slHandle: HTMLDivElement
    private hSlider: verticalSlider
    private aSlider: verticalSlider
    private updateCallback: (c: color) => void

    private hue: number = 0

    private createPicker() {
        this.pickerWindow = <HTMLDivElement>addChild("div", this.parent, {class: "picker-window"})
        this.defaultCSSDisplay = this.pickerWindow.style.display
        this.slPicker = <HTMLDivElement>addChild("div", this.pickerWindow, {class: "sl-picker"})
        this.slHandle = <HTMLDivElement>addChild("div", this.slPicker, {class: "sl-handle"})
        this.hSlider = new verticalSlider("h", this.pickerWindow, this.setHHandle.bind(this))
        this.aSlider = new verticalSlider("a", this.pickerWindow, this.setAHandle.bind(this))
    }

    private displayPicker(on: boolean) {
        this.pickerWindow.style.display = on ? this.defaultCSSDisplay : "none"
    }

    private setSLHandle(x:number, y:number) {
        const rect = this.slPicker.getBoundingClientRect()
        x = clamp(x, rect.left, rect.right)
        y = clamp(y, rect.top, rect.bottom)
        const ox = x - rect.left
        const oy = y - rect.top

        this.slHandle.style.left = `${ox}px`
        this.slHandle.style.top = `${oy}px`

        const s = ox / rect.width
        const v = oy / rect.height

        this.setSV(s, 1-v)
    }

    private setHHandle() {
        const [h, s, v] = this.currentColor.to_hsv()
        this.setHSV(this.hSlider.value * 360, s, v)
    }

    private setAHandle() {

    }

    constructor(parentSelector: string, callback: (c: color) => void) {
        this.updateCallback = callback
        this.parent = document.querySelector(parentSelector)
        this.createPicker()
        this.setColor(new color(32, 68, 32))
        this.displayPicker(false)

        window.addEventListener("mousedown", e => this.displayPicker(this.parent.contains(<Element>e.target)))

        let dragging = false
        this.slPicker.addEventListener("mousedown", e => {
            dragging = true
            this.setSLHandle(e.clientX, e.clientY)
        })
        window.addEventListener("mouseup", () => dragging = false)
        window.addEventListener("mousemove", e => {
            if (dragging)
                this.setSLHandle(e.clientX, e.clientY)
        })

    }

    private setHue(hue: number) {
        this.hue = hue
        const fullSVColor = color.from_hsv(this.hue, 1, 1)
        this.slPicker.style.color = fullSVColor.to_string()
        this.hSlider.setHandleColor(fullSVColor)
    }

    private setSV(s: number, v: number) {
        const c = color.from_hsv(this.hue, s, v)
        this.currentColor = c
        this.slHandle.style.color = c.to_string()
        this.parent.style.color = c.to_string()
        this.updateCallback(c)
    }

    private setHandlePositionsFromHSV(h: number, s: number, v: number) {
        const slPickerRect = this.slPicker.getBoundingClientRect()
        s *= slPickerRect.width
        v = 1 - v
        v *= slPickerRect.height
        this.slHandle.style.left = `${s}px`
        this.slHandle.style.top = `${v}px`
        
        h /= 360
        this.hSlider.setNormalizedHandlePosition(h)
    }

    setColor(c: color) {
        const [h, s, v] = c.to_hsv()
        this.setHandlePositionsFromHSV(h, s, v)
        this.setHSV(h, s, v)
    }

    setHSV(h:number, s:number, v:number) {
        this.setHue(h)
        this.setSV(s, v)
    }
}
