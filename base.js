import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default class Base {
  constructor () {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.clock = new THREE.Clock()
    this.initRenderer()
    this.initScene()
    this.initCamera()
    this.render()
  }
  // 创建渲染器
  initRenderer (canvas) {
    const renderer = this.renderer = new THREE.WebGLRenderer({
      // canvas,
      antialias: true,
    })
    renderer.setSize(this.width, this.height)
    // renderer.setClearColor(new THREE.Color('#f9edfe'))
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    if (!canvas) {
      document.body.appendChild(renderer.domElement)
    }
  }
  // 创建场景
  initScene () {
    const scene = this.scene = new THREE.Scene()
  }
  // 创建相机
  initCamera () {
    const camera = this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100)
    camera.position.set(7, 7, 7)
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
    controls.target = new THREE.Vector3(-10, 80, 0)
    controls.enableZoom = true
    controls.rotateSpeed = 1
    controls.update()
  }
  // 渲染
  render () {
    const { renderer, scene, camera } = this
    renderer.clear()
    renderer.render(scene, camera)
    window.requestAnimationFrame(() => {
      this.render()
    })
  }
}
