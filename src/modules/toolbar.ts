import pixelCanvas, {tool} from "./pixelCanvas"

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
        this.parent = document.querySelector(parentSelector)

        this.parent.childNodes.forEach((c, i) => {
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

    getFromId(id: string) { return this.values[this.ids.get(id)]}
    getFromKeybind(keybind: string) { return this.values[this.keybinds.get(keybind)]}

    setActiveFromId(id: string) {
        this.canvas.currentTool = this.getFromId(id);
        (<HTMLInputElement>document.getElementById(id)).checked = true
    }

    setActiveFromKeybind(keybind: string) {
        this.canvas.currentTool = this.getFromKeybind(keybind)
        const index = this.keybinds.get(keybind)
        for (let [id, i] of this.ids.entries()) {
            if (index === i)
                (<HTMLInputElement>document.getElementById(id)).checked = true
        }
    }
}