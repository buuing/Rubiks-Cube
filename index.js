import * as THREE from 'three'
import Base from './base'
import { rotateAroundWorldAxis } from './utils'

const XYZ_VALUE = 0 ^ 1 ^ 2

const AxesEnum = {
  0: 'x',
  1: 'y',
  2: 'z',
  'x': 0,
  'y': 1,
  'z': 2,
}

class App extends Base {
  startPoint = null
  movePoint = null
  isRotating = false
  mouse = new THREE.Vector2(0, 0)
  raycaster = new THREE.Raycaster()
  axes = [
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 0, -1)
  ]

  constructor () {
    super()
    this.initCube()
    window.addEventListener('mousedown', this.onMouseDown.bind(this))
    window.addEventListener('mousemove', this.onMouseMove.bind(this))
    window.addEventListener('mouseup', this.onMouseUp.bind(this))
  }

  initCube () {
    const cubes = this.cubes = new THREE.Group()
    this.scene.add(cubes)
    // 立方体
    const size = 1, gutter = 0.1
    const geometry = new THREE.BoxGeometry(size - gutter, size - gutter, size - gutter)
    const material = new THREE.MeshNormalMaterial()
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 9; j++) {
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(
          (j / 3 >> 0) * size - size,
          size * i - size,
          (j % 3) * size - size,
        )
        cubes.add(mesh)
      }
    }
    // 外壳
    const outsideSize = size * 3 + 0.01 - gutter
    const outside = new THREE.Mesh(
      new THREE.BoxGeometry(outsideSize, outsideSize, outsideSize),
      new THREE.MeshBasicMaterial({
        color: '#fff',
        opacity: 0.5,
        transparent: true
      })
    )
    cubes.add(outside)
  }

  rotateCube () {
    this.isRotating = true
    const sub = this.movePoint.sub(this.startPoint)
    let minAngle = Infinity, minIndex = 0, planeNormalIndex
    this.axes.forEach((vec3, index) => {
      const angle = sub.angleTo(vec3)
      // 平面法向量
      if (vec3.angleTo(this.startPlane) === 0) {
        planeNormalIndex = index
      }
      // 旋转方向
      if (angle < minAngle) {
        minAngle = angle
        minIndex = index
      }
    })
    const planeNormalKey = planeNormalIndex / 2 >> 0
    const planeNormal = AxesEnum[planeNormalKey]
    const rotateAxisKey = minIndex / 2 >> 0
    console.log('平面法向量', planeNormal)
    console.log('旋转方向', ['x+', 'x-', 'y+', 'y-', 'z+', 'z-'][minIndex])
    const cubePosition = XYZ_VALUE ^ rotateAxisKey ^ planeNormalKey
  }

  onMouseDown (e) {
    // 旋转
    if (this.intersect1 && !this.isRotating) {
      // 起始点
      this.startPoint = this.intersect1.point
      // 起始平面
      this.startPlane = this.intersect2.face.normal
    }
  }

  onMouseMove (e) {
    this.mouse.x = (e.clientX / this.width - 0.5) * 2
    this.mouse.y = -(e.clientY / this.height - 0.5) * 2
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects = this.raycaster.intersectObjects(this.cubes.children)
    this.intersect1 = intersects[0]
    this.intersect2 = intersects[1]

    if (this.intersect1 && !this.isRotating && this.startPoint) {
      this.movePoint = this.intersect1.point
      if (!this.movePoint.equals(this.startPoint)) {
        this.rotateCube()
      }
    }
  }

  onMouseUp (e) {
    this.startPoint = null
    this.movePoint = null
    this.isRotating = false
  }
}
new App()
