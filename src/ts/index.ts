import pixelCanvas from "./components/pixel_canvas.js"
import colorPicker from "./components/color_picker.js"
import toolbar from "./components/toolbar.js"

import {pen_tool, eraser_tool, eyedropper_tool, fill_tool} from "./tools.js"

import createSkinViewer from "./skin_viewer.js"
import skin from "./skin.js"

const steve = new skin(false)

const canvas = new pixelCanvas("#canvas", steve.head.inner.front)
const picker = new colorPicker("#color-picker", c => canvas.currentColor = c.copy())

const tools = new toolbar(".tools", canvas)
tools.register("pen", "KeyB", new pen_tool)
tools.register("eraser", "KeyE", new eraser_tool)
tools.register("eyedropper", "KeyI", new eyedropper_tool(picker, () => {
    tools.setActiveFromId("pen")
}))
tools.register("fill", "KeyF", new fill_tool)

tools.setActiveFromId("pen")

let alphaEnabled = false

let body = false
window.addEventListener("keydown", e => {
    if (e.code === "KeyZ" && e.ctrlKey) {
        if (e.shiftKey) canvas.redo()
        else canvas.undo()
    }
    else if (e.code === "KeyX") {
        alphaEnabled = !alphaEnabled
        picker.alphaEnabled = alphaEnabled
    } else if (e.code === "KeyQ") {
        body = !body
        canvas.setSkinSection(body ? steve.body.inner.front : steve.head.inner.front)
    }
    else if (tools.getFromKeybind(e.code) !== undefined)
        tools.setActiveFromKeybind(e.code)
    else console.log(tools)
})

const threedview = createSkinViewer(<HTMLDivElement>document.querySelector("#threedview"), false)
if (threedview) {
    threedview.setTexture(steve.getImageURL())
    canvas.onUpdate = () => { threedview.setTexture(steve.getImageURL()) }
}