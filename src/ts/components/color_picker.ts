import color from "./color.js"

interface attributeList { [key: string]: string }

const addChild = (tag: string, parent: HTMLElement, attributes: attributeList = {}): HTMLElement => {
    const e = document.createElement(tag)
    parent.appendChild(e)
    for (const a in attributes)
        e.setAttribute(a, attributes[a])
    return e
}

const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

class verticalSlider {
    value: number = 0

    private slider: HTMLDivElement
    private handle: HTMLDivElement
    private updateCallback: () => void
    private defaultCSSDisplay: string

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
        this.defaultCSSDisplay = this.slider.style.display

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
        this.slider.style.color = color.with_full_alpha().to_string()
        this.handle.style.color = color.to_string()
    }

    setNormalizedHandlePosition(v: number) {
        const rect = this.slider.getBoundingClientRect()
        v *= rect.height
        this.handle.style.top = `${v}px`
    }

    set visible(v: boolean) { this.slider.style.display = v ? this.defaultCSSDisplay : "none" }
}

class inputField {
    container: HTMLDivElement
    input: HTMLInputElement
    label: HTMLLabelElement
    private defaultCSSDisplay: string

    constructor(name: string, parent: HTMLElement, type: string = "number") {
        this.container = <HTMLDivElement>addChild("div", parent, {class: name + "-input"})
        this.input = <HTMLInputElement>addChild("input", this.container, {type: type, name: name, id: name})
        this.label = <HTMLLabelElement>addChild("label", this.container, {for: name})
        this.label.innerText = name
        this.defaultCSSDisplay = this.container.style.display
    }

    setBounds(min = 0, max = 100): inputField {
        this.input.setAttribute("min", `${min}`)
        this.input.setAttribute("max", `${max}`)
        return this
    }

    get value(): string { return this.input.value }
    set value(v: string) { this.input.value = v }

    set visible(v: boolean) { this.container.style.display = v ? this.defaultCSSDisplay : "none" }
}

interface optionList { [key: string]: () => void }

class dropdownMenu {
    private menu: HTMLSelectElement
    private optionIndex: Map<string, number> = new Map()
    private callbacks: optionList
    mode: string = ""

    constructor(options: optionList = {}, parent: HTMLElement, className: string = "") {
        const container = <HTMLDivElement>addChild("div", parent, className ? {class: className} : {})
        this.menu = <HTMLSelectElement>addChild("select", container)
        this.callbacks = options
        let i = 0
        for (const option in options) {
            (<HTMLOptionElement>addChild("option", this.menu, {value: option})).innerText = option
            this.optionIndex.set(option, i++)
        }
        this.menu.addEventListener("change", () => {
            this.mode = this.menu.value
            this.callbacks[this.menu.value]()
        })
        addChild("i", container, {class: "fa-solid fa-angle-down"})
    }

    select(option: string) {
        const i = this.optionIndex.get(option)
        if (i !== undefined) this.menu.selectedIndex = i
        this.callbacks[option]()
    }
}

export default class colorPicker {

    private currentColor: color = color.red

    private parent: HTMLElement
    private pickerWindow: HTMLDivElement
    private defaultCSSDisplay: string
    private slPicker: HTMLDivElement
    private slHandle: HTMLDivElement
    private hSlider: verticalSlider
    private aSlider: verticalSlider
    private inputArea: HTMLDivElement
    private inputType: dropdownMenu
    private hsvInputs: HTMLDivElement
    private inputs: inputField[] = []
    private hexInput: inputField
    private updateCallback: (c: color) => void
    
    private hue = 0

    private displayPicker(on: boolean) {
        this.pickerWindow.style.display = on ? this.defaultCSSDisplay : "none"
    }
    private selectHSV() {
        this.hexInput.container.style.display = "none"
        this.hsvInputs.style.display = "flex"
    }
    private selectHex() {
        this.hexInput.container.style.display = "block"
        this.hsvInputs.style.display = "none"
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
        const v = 1 - (oy / rect.height)

        this.setSV(s, v)
        this.setInputFieldsFromHSV(this.hue, s, v, this.currentColor.a)
        this.updateCallback(this.currentColor)
    }
    private setHHandle() {
        const [_h, s, v, a] = this.currentColor.to_hsv()
        this.setHSV(this.hSlider.value * 360, s, v, a)
    }
    private setAHandle() {
        this.setA(1 - this.aSlider.value)
        const [h, s, v, a] = this.currentColor.to_hsv()
        this.setInputFieldsFromHSV(h, s, v, a)
        this.updateCallback(this.currentColor)
    }


    constructor(parentSelector: string, callback: (c: color) => void) {
        this.updateCallback = callback
        this.parent = document.querySelector(parentSelector)!
        
        this.pickerWindow = <HTMLDivElement>addChild("div", this.parent, {class: "picker-window"})
        this.defaultCSSDisplay = this.pickerWindow.style.display
        
        const sliderArea = <HTMLDivElement>addChild("div", this.pickerWindow, {class: "slider-area"})
        this.slPicker = <HTMLDivElement>addChild("div", sliderArea, {class: "sl-picker"})
        this.slHandle = <HTMLDivElement>addChild("div", this.slPicker, {class: "sl-handle"})
        this.hSlider = new verticalSlider("h", sliderArea, this.setHHandle.bind(this))
        this.aSlider = new verticalSlider("a", sliderArea, this.setAHandle.bind(this))

        this.inputArea = <HTMLDivElement>addChild("div", this.pickerWindow, {class: "input-area"})
        this.inputType = new dropdownMenu({hsv: this.selectHSV.bind(this), hex: this.selectHex.bind(this)}, this.inputArea, "input-type")
        this.hsvInputs = <HTMLDivElement>addChild("div", this.inputArea, {class: "hsva-inputs"})
        this.inputs.push(new inputField("hue", this.hsvInputs).setBounds(0, 360))
        this.inputs.push(new inputField("saturation", this.hsvInputs).setBounds())
        this.inputs.push(new inputField("value", this.hsvInputs).setBounds())
        this.inputs.push(new inputField("alpha", this.hsvInputs).setBounds())
        
        this.hexInput = new inputField("hex", this.inputArea, "text")

        this.inputType.select("hsv")

        this.setColor(color.red)
        this.alphaEnabled = false
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

        const validateNumber = (value: number, index: number): boolean => {
            if (!isNaN(value)) {
                this.inputs[index].input.style.color = "black"
                return true
            } else {
                this.inputs[index].input.style.color = "red"
                return false
            }
        }

        this.hsvInputs.addEventListener("input", () => {
            const h = clamp(parseInt(this.inputs[0].value), 0, 360)
            const s = clamp(parseInt(this.inputs[1].value) / 100, 0, 1)
            const v = clamp(parseInt(this.inputs[2].value) / 100, 0, 1)
            const a = clamp(parseInt(this.inputs[3].value) / 100, 0, 1)
            if (validateNumber(h, 0) && validateNumber(s, 1) && validateNumber(v, 2) && validateNumber(a, 3)) {
                this.setHSV(h, s, v, a)
                this.setHandlePositionsFromHSV(h, s, v, a)
            }
        })

        this.hexInput.input.addEventListener("input", () => {
            const c = color.from_hex(this.hexInput.value)
            if (c) {
                this.hexInput.input.style.color = "black"
                this.setColor(c, false)
            }
            else this.hexInput.input.style.color = "red"
        })
    }

    private setHue(hue: number) {
        this.hue = hue
        const fullSVColor = color.from_hsv(hue, 1, 1)
        this.slPicker.style.color = fullSVColor.to_string()
        this.hSlider.setHandleColor(fullSVColor)
    }

    private setSV(s: number, v: number) {
        this.currentColor = color.from_hsv(this.hue, s, v, this.currentColor ? this.currentColor.a : 1)
        this.slHandle.style.color = this.currentColor.with_full_alpha().to_string()
        this.parent.style.color = this.currentColor.to_string()
        this.aSlider.setHandleColor(this.currentColor)
    }

    private setA(alpha: number) {
        this.currentColor.a = alpha
        this.parent.style.color = this.currentColor.to_string()
        this.aSlider.setHandleColor(this.currentColor)
    }

    private setHandlePositionsFromHSV(h: number, s: number, v: number, a: number) {
        const enabled = this.pickerWindow.style.display === this.defaultCSSDisplay
        if (!enabled) this.displayPicker(true)

        const slPickerRect = this.slPicker.getBoundingClientRect()
        s *= slPickerRect.width
        v = 1 - v
        v *= slPickerRect.height
        this.slHandle.style.left = `${s}px`
        this.slHandle.style.top = `${v}px`
        
        h /= 360
        this.hSlider.setNormalizedHandlePosition(h)

        a = 1 - a
        this.aSlider.setNormalizedHandlePosition(a)

        if (!enabled) this.displayPicker(false)
    }

    private setInputFieldsFromHSV(h:number, s:number, v:number, a:number = 1) {
        this.inputs[0].value = `${Math.round(h)}`
        this.inputs[1].value = `${Math.round(s * 100)}`
        this.inputs[2].value = `${Math.round(v * 100)}`
        this.inputs[3].value = `${Math.round(a * 100)}`
        this.hexInput.value = this.currentColor.to_hex()
    }

    setColor(c: color, setInputs = true) {
        const [h, s, v, a] = c.to_hsv()
        this.setHandlePositionsFromHSV(h, s, v, a)
        this.setHSV(h, s, v, a, setInputs)
    }

    getColor() { return this.currentColor; }

    setHSV(h:number, s:number, v:number, a:number = 1, setInputs = true) {
        this.setHue(h)
        this.setSV(s, v)
        this.setA(a)
        setInputs && this.setInputFieldsFromHSV(this.hue, s, v, a)
        this.updateCallback(this.currentColor)
    }

    set alphaEnabled(enable: boolean) {
        this.inputs[3].visible = enable
        this.aSlider.visible = enable
        if (!enable) {
            this.setColor(this.currentColor.with_full_alpha())
        }
    }
}
