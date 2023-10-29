import {
    Scene, WebGLRenderer, PerspectiveCamera,
    Mesh, MeshStandardMaterial,
    AmbientLight,
    TextureLoader,
    DoubleSide, NearestFilter, Group
} from 'three'

import WebGL from 'three/examples/jsm/capabilities/WebGL.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import skin from './utils/skin'

const steveInnerURL = new URL('../assets/model/steve.glb', import.meta.url).href
const steveOuterURL = new URL("../assets/model/steveOuter.glb", import.meta.url).href
const alexInnerURL = new URL("../assets/model/alex.glb", import.meta.url).href
const alexOuterURL = new URL("../assets/model/alexOuter.glb", import.meta.url).href

let inner_material: MeshStandardMaterial
let outer_material: MeshStandardMaterial

let renderer: WebGLRenderer
let scene: Scene
export default function create_scene(canvas: HTMLCanvasElement, skin: skin) {
    if (!WebGL.isWebGLAvailable()) {
        canvas.parentElement!.appendChild(WebGL.getWebGLErrorMessage())
        return
    }

    scene = new Scene
    load_assets(skin.slim)
    scene.add(new AmbientLight(0xffffff))

    inner_material = new MeshStandardMaterial
    outer_material = new MeshStandardMaterial({ transparent: true, side: DoubleSide })

    renderer = new WebGLRenderer({ canvas: canvas, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)

    let camera: PerspectiveCamera
    let controls: OrbitControls
    const presize = () => renderer.setSize(1, 1)
    const resize = () => {

        camera = new PerspectiveCamera(75, canvas.parentElement!.clientWidth / canvas.parentElement!.clientHeight, 0.1, 1000)
        camera.translateZ(3.6)
        camera.translateY(0.5)

        controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.enablePan = false
        controls.enableZoom = false

        renderer.setSize(canvas.parentElement!.clientWidth - 1, canvas.parentElement!.clientHeight - 1)
    }

    const animate = () => {
        requestAnimationFrame(animate)
        controls.update()
        renderer.render(scene, camera)
    }

    resize()
    animate()

    return [presize, resize]
}

let steve_inner: Group
let steve_outer: Group
let alex_inner: Group
let alex_outer: Group

let modelLoader = new GLTFLoader
async function load_assets(slim: boolean) {
    steve_inner = (await modelLoader.loadAsync(steveInnerURL)).scene
    steve_outer = (await modelLoader.loadAsync(steveOuterURL)).scene
    alex_inner = (await modelLoader.loadAsync(alexInnerURL)).scene
    alex_outer = (await modelLoader.loadAsync(alexOuterURL)).scene

    steve_inner.traverse(node => {
        if (!(node instanceof Mesh)) return
        node.material = inner_material
    })

    steve_outer.traverse(node => {
        if (!(node instanceof Mesh)) return
        node.material = outer_material
    })

    alex_inner.traverse(node => {
        if (!(node instanceof Mesh)) return
        node.material = inner_material
    })

    alex_outer.traverse(node => {
        if (!(node instanceof Mesh)) return
        node.material = outer_material
    })

    set_slim(slim)
}

export function set_slim(slim: boolean) {
    scene.remove(slim ? steve_inner : alex_inner)
    scene.remove(slim ? steve_outer : alex_outer)
    scene.add(slim ? alex_inner : steve_inner)
    scene.add(slim ? alex_outer : steve_outer)
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