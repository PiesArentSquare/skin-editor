import pixelCanvas from "./modules/pixelCanvas.js"
import colorPicker from "./modules/colorPicker.js"

window.addEventListener("load", () => {
    const canvas = new pixelCanvas("#canvas", 8, 12)
    const picker = new colorPicker("#color-picker", c => canvas.currentColor = c)
})
