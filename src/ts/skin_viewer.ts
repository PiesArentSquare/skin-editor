import {
    Scene, WebGLRenderer, PerspectiveCamera,
    Group, Mesh, MeshStandardMaterial,
    AmbientLight,
    TextureLoader,
    DoubleSide, NearestFilter
} from 'three'

import WebGL from 'three/examples/jsm/capabilities/WebGL'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default function createSkinViewer(parent: HTMLElement, alex: boolean): skinViewer | void {
    if (WebGL.isWebGLAvailable()) {
        return new skinViewer(parent, alex)
    } else {
        const warning = WebGL.getWebGLErrorMessage()
        parent.appendChild(warning)
    }
}

const steveInnerURL = new URL('../../assets/model/steve.glb', import.meta.url).href
const steveOuterURL = new URL("../../assets/model/steveOuter.glb", import.meta.url).href
const alexInnerURL = new URL("../../assets/model/alex.glb", import.meta.url).href
const alexOuterURL = new URL("../../assets/model/alexOuter.glb", import.meta.url).href

export class skinViewer {
    private scene = new Scene
    private renderer = new WebGLRenderer
    private camera: PerspectiveCamera | undefined
    private controls: OrbitControls | undefined

    private innerModel: Group | undefined
    private outerModel: Group | undefined
    private innerMaterial = new MeshStandardMaterial
    private outerMaterial = new MeshStandardMaterial({ transparent: true, side: DoubleSide })

    private textureLoader = new TextureLoader
    private modelLoader = new GLTFLoader

    constructor(parent: HTMLElement, alex: boolean) { 
        const resize = () => {
            this.camera = new PerspectiveCamera(75, parent.clientWidth / parent.clientHeight, 0.1, 1000)
            this.camera.translateZ(5)

            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.enableDamping = true
            this.controls.enablePan = false
            this.controls.enableZoom = false

            this.renderer.setSize(parent.clientWidth, parent.clientHeight)
        }
        resize()

        window.addEventListener('resize', resize)

        this.renderer.setPixelRatio(window.devicePixelRatio)

        this.loadAssets(alex)

        this.scene.add(new AmbientLight(0xffffff))

        const animate = () => {
            requestAnimationFrame(animate)
            this.controls!.update()
            this.renderer.render(this.scene, this.camera!)
        }
        animate()

        parent.appendChild(this.renderer.domElement)
    }

    private async loadAssets(alex: boolean) {
        const inner = alex ? alexInnerURL : steveInnerURL
        const outer = alex ? alexOuterURL : steveOuterURL
        this.innerModel = (await this.modelLoader.loadAsync(inner)).scene
        this.outerModel = (await this.modelLoader.loadAsync(outer)).scene
        
        this.innerModel.traverse(node => {
            if (!(node instanceof Mesh)) return
            node.material = this.innerMaterial
        })

        this.outerModel.traverse(node => {
            if (!(node instanceof Mesh)) return
            node.material = this.outerMaterial
        })

        this.scene.add(this.innerModel, this.outerModel)
    }

    async setTexture(url: string) {
        let skin = await this.textureLoader.loadAsync(url)
        skin.minFilter = NearestFilter
        skin.magFilter = NearestFilter
        skin.flipY = false
        if (this.innerMaterial.map) {
            this.innerMaterial.map = skin
            this.outerMaterial.map = skin
        } else if (this.innerMaterial) {
            this.innerMaterial.map = skin
            this.outerMaterial.map = skin
            this.innerMaterial.needsUpdate = true
            this.outerMaterial.needsUpdate = true
        }
    }
}
