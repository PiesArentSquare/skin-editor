import pixelCanvas from "./components/pixel_canvas.js"
import colorPicker from "./components/color_picker.js"
import toolbar from "./components/toolbar.js"

import {pen_tool, eraser_tool, eyedropper_tool, fill_tool} from "./tools.js"

const canvas = new pixelCanvas("#canvas", 8, 12)
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

window.addEventListener("keydown", e => {
    if (e.code === "KeyZ" && e.ctrlKey) {
        if (e.shiftKey) canvas.redo()
        else canvas.undo()
    }
    else if (e.code === "KeyX") {
        alphaEnabled = !alphaEnabled
        picker.alphaEnabled = alphaEnabled
    }
    else if (tools.getFromKeybind(e.code) !== undefined)
        tools.setActiveFromKeybind(e.code)
})

import * as THREE from 'three'
import WebGL from 'three/examples/jsm/capabilities/WebGL'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const threedview = <HTMLDivElement>document.querySelector("#threedview")

if (WebGL.isWebGLAvailable()) {
    const width = threedview.clientWidth
    const height = threedview.clientHeight
    
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.translateZ(5)
    
    const renderer = new THREE.WebGLRenderer()
    threedview.appendChild(renderer.domElement)
    
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.enablePan = false
    controls.enableZoom = false

    const steveURL = new URL('../assets/model/steve.glb', import.meta.url).href
    const steveOuterURL = new URL('../assets/model/steveOuter.glb', import.meta.url).href
    let steve: THREE.Group
    let steveOuter: THREE.Group
    const textureLoader = new THREE.TextureLoader()

    const steveMaterial = new THREE.MeshStandardMaterial()
    const steveOuterMaterial = new THREE.MeshStandardMaterial({transparent: true, side: THREE.DoubleSide})

    const updateTexture = async (url: string) => {
        let skin = await textureLoader.loadAsync(url)
        skin.minFilter = THREE.NearestFilter
        skin.magFilter = THREE.NearestFilter
        skin.flipY = false
        if (steveMaterial.map) {
            steveMaterial.map = skin
            steveOuterMaterial.map = skin
        } else {
            steveMaterial.map = skin
            steveOuterMaterial.map = skin
            steveMaterial.needsUpdate = true
            steveOuterMaterial.needsUpdate = true
        }
    }

    const load = async () => {
        const modelLoader = new GLTFLoader()
        steve = (await modelLoader.loadAsync(steveURL)).scene
        steve.traverse(node => {
            if (!(node instanceof THREE.Mesh)) return
            node.material = steveMaterial
        })
        scene.add(steve)

        steveOuter = (await modelLoader.loadAsync(steveOuterURL)).scene
        steveOuter.traverse(node => {
            if (!(node instanceof THREE.Mesh)) return
            node.material = steveOuterMaterial
        })
        scene.add(steveOuter)
    }
    load()
    
    canvas.onUpdate = () => {
        updateTexture(canvas.generateImageURL())
    }
    
    // const pointLight = new THREE.PointLight(0xffffff)
    // pointLight.position.set(5, 5, 5)
    // scene.add(pointLight)
    const ambientLight = new THREE.AmbientLight(0xffffff)
    scene.add(ambientLight)
    
    function animate() {
        requestAnimationFrame(animate)
        controls.update()
        renderer.render(scene, camera)
    }
    animate()
} else {
    const warning = WebGL.getWebGLErrorMessage()
    threedview.appendChild(warning)
}
