import pixelCanvas, {tool} from "./pixel_canvas"

export default class toolbar {
    private parent: HTMLElement
    private canvas: pixelCanvas
    private ids: Map<string, number>
    private keybinds: Map<string, number>
    private values: tool[]

    constructor(parentSelector: string, canvas: pixelCanvas) {
        this.ids = new Map<string, number>()
        this.keybinds = new Map<string, number>()
        this.values = []
        this.canvas = canvas
        this.parent = document.querySelector(parentSelector)!

        this.parent.childNodes.forEach(c => {
            c.addEventListener("click", () => {
                let id = (<HTMLElement>c).id
                if (id !== "") this.setActiveFromId(id)
            })
        })
    }

    register(id: string, keybind: string, value: tool) {
        this.ids.set(id, this.values.length)
        this.keybinds.set(keybind, this.values.length)
        this.values.push(value)
    }

    getFromId(id: string) {
        const i = this.ids.get(id)
        return (i !== undefined) ? this.values[i] : undefined
    }
    getFromKeybind(keybind: string) {
        const i = this.keybinds.get(keybind)
        return (i !== undefined) ? this.values[i] : undefined
    }

    setActiveFromId(id: string) {
        const tool = this.getFromId(id)
        if (tool) {
            this.canvas.currentTool = tool;
            (<HTMLInputElement>document.getElementById(id)).checked = true
        }
    }

    setActiveFromKeybind(keybind: string) {
        const tool = this.getFromKeybind(keybind)
        if (tool) {
            this.canvas.currentTool = tool
            const index = this.keybinds.get(keybind)
            for (let [id, i] of this.ids.entries()) {
                if (index === i)
                    (<HTMLInputElement>document.getElementById(id)).checked = true
            }
        }
    }
}