import pixelCanvas from "./modules/pixelCanvas.js"
import colorPicker from "./modules/colorPicker.js"
import color from "./modules/color.js"

window.addEventListener("load", () => {
    const canvas = new pixelCanvas("#canvas", 8, 12)
    const picker = new colorPicker("#color-picker", c => canvas.currentColor = c.copy())

    let alphaEnabled = false
    window.addEventListener("keypress", e => {
        if (e.code === "KeyX") {
            alphaEnabled = !alphaEnabled
            picker.alphaEnabled = alphaEnabled
        }
    })

    window.addEventListener("keydown", e => {
        if (e.code === "KeyZ" && e.ctrlKey) {
            if (e.shiftKey) canvas.redo()
            else canvas.undo()
        }
    })
})
