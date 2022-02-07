import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default class Base {
  width: number
  height: number
  renderer!: THREE.WebGLRenderer
  scene!: THREE.Scene
  camera!: THREE.PerspectiveCamera
  controls!: OrbitControls

  constructor () {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.initRenderer()
    this.initScene()
    this.initCamera()
    this.initControls()
    this.render()
  }
  // 创建渲染器
  initRenderer () {
    const renderer = this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    })
    renderer.setSize(this.width, this.height)
    renderer.setPixelRatio(window.devicePixelRatio)
    document.body.appendChild(renderer.domElement)
  }
  // 创建场景
  initScene () {
    const scene = this.scene = new THREE.Scene()
  }
  // 创建相机
  initCamera () {
    const camera = this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100)
    camera.position.set(15, 15, 15)
    camera.lookAt(0, 0, 0)
  }
  // 创建光源
  initLight (color = 0xffffff) {
    const ambientLight = new THREE.AmbientLight(color)
    this.scene.add(ambientLight)
  }
  // 轨道控制器
  initControls () {
    const { renderer, camera } = this
    const controls = this.controls = new OrbitControls(camera, renderer.domElement)
    controls.target = new THREE.Vector3(0, 0, 0)
    controls.enableZoom = false
    controls.rotateSpeed = 1
    controls.update()
  }
  // 渲染
  render () {
    const { renderer, scene, camera } = this
    this.controls.update()
    renderer.clear()
    renderer.render(scene, camera)
    window.requestAnimationFrame(() => {
      this.render()
    })
  }
}
