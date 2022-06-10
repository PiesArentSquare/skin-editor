import {
    Scene, WebGLRenderer, PerspectiveCamera,
    Mesh, MeshStandardMaterial,
    AmbientLight,
    TextureLoader,
    DoubleSide, NearestFilter
} from 'three'

import WebGL from 'three/examples/jsm/capabilities/WebGL'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import skin from './utils/skin'

const steveInnerURL = new URL('../assets/model/steve.glb', import.meta.url).href
const steveOuterURL = new URL("../assets/model/steveOuter.glb", import.meta.url).href
const alexInnerURL = new URL("../assets/model/alex.glb", import.meta.url).href
const alexOuterURL = new URL("../assets/model/alexOuter.glb", import.meta.url).href

let inner_material: MeshStandardMaterial
let outer_material: MeshStandardMaterial

let renderer: WebGLRenderer
export default function create_scene(canvas: HTMLCanvasElement, skin: skin) {
    if (!WebGL.isWebGLAvailable()) {
        canvas.parentElement.appendChild(WebGL.getWebGLErrorMessage())
        return
    }

    let scene = new Scene
    load_assets(scene, skin.alex)
    scene.add(new AmbientLight(0xffffff))

    inner_material = new MeshStandardMaterial
    outer_material = new MeshStandardMaterial({transparent: true, side: DoubleSide})

    renderer = new WebGLRenderer({canvas: canvas, alpha: true})
    renderer.setPixelRatio(window.devicePixelRatio)
    
    let camera: PerspectiveCamera
    let controls: OrbitControls
    const resize = () => {
        camera = new PerspectiveCamera(75, canvas.parentElement.clientWidth / canvas.parentElement.clientHeight, 0.1, 1000)
        camera.translateZ(3.6)
        camera.translateY(0.5)
        
        controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.enablePan = false
        controls.enableZoom = false
        
        renderer.setSize(canvas.parentElement.clientWidth - 1, canvas.parentElement.clientHeight - 1)
    }
    
    const animate = () => {
        requestAnimationFrame(animate)
        controls.update()
        renderer.render(scene, camera)
    }

    resize()
    animate()

    return resize
}

export function clear_height() {
    renderer.setSize(1, 1)
}

let modelLoader = new GLTFLoader
async function load_assets(scene: Scene, alex: boolean) {
    const inner_model = (await modelLoader.loadAsync(alex ? alexInnerURL : steveInnerURL)).scene
    const outer_model = (await modelLoader.loadAsync(alex ? alexOuterURL : steveOuterURL)).scene
    
    inner_model.traverse(node => {
        if (!(node instanceof Mesh)) return
        node.material = inner_material
    })
    
    outer_model.traverse(node => {
        if (!(node instanceof Mesh)) return
        node.material = outer_material
    })
    
    scene.add(inner_model, outer_model)
}

let texture_loader = new TextureLoader
export async function update_texture(url: string) {
    let s = await texture_loader.loadAsync(url)
    s.minFilter = NearestFilter
    s.magFilter = NearestFilter
    s.flipY = false
    const needs_update = !inner_material.map
    inner_material.map = s
    outer_material.map = s
    if (needs_update) {
        inner_material.needsUpdate = true
        outer_material.needsUpdate = true
    }
}