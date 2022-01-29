import * as THREE from 'three'
import anime from 'animejs'
import Base from './base'
import { rotateAroundWorldAxis, XYZ_VALUE, AxesEnum, Axes, getCubeFace, colors } from './utils'
import { Pane } from 'tweakpane'

const pane = new Pane({
  title: '调试'
})
const debug = {
  level: 3
}

class App extends Base {
  startPoint = null
  movePoint = null
  isRotating = false
  mouse = new THREE.Vector2(0, 0)
  raycaster = new THREE.Raycaster()
  smallCube = []
  cubeSize = 2
  prevTime = 0

  constructor () {
    super()
    this.initDebug()
    this.initCube()
    // this.initLight()
    window.addEventListener('mousedown', this.onMouseDown.bind(this))
    window.addEventListener('touchstart', this.onMouseDown.bind(this))
    window.addEventListener('mousemove', this.onMouseMove.bind(this))
    window.addEventListener('touchmove', this.onMouseMove.bind(this))
    window.addEventListener('mouseup', this.onMouseUp.bind(this))
  }

  computeMaterial (logic, materials, defaultMaterial) {
    return logic.map((item, index) => item ? materials[index] : defaultMaterial)
  }

  initCube (level = 3) {
    this.cube && this.scene.remove(this.cube)
    const cube = this.cube = new THREE.Group()
    this.scene.add(cube)
    // 小立方体
    const size = this.cubeSize, gutter = 0
    const w = level, h = level, d = level
    const offsetWidth =  w * size / 2 - size / 2
    const offsetHeight = h * size / 2 - size / 2
    const offsetDepth = d * size / 2 - size / 2
    const geometry = new THREE.BoxGeometry(size - gutter, size - gutter, size - gutter)
    const materials = colors.map(color => {
      const texture = new THREE.Texture(getCubeFace(color))
      texture.needsUpdate = true
      texture.generateMipmaps = false
      return new THREE.MeshBasicMaterial({ map: texture })
    })
    const defaultMaterial = new THREE.MeshBasicMaterial({ color: '#000' })
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < w * h; j++) {
        const currMaterial = this.computeMaterial([
          (j + 1) % w === 0,
          j % w === 0,
          i === d - 1,
          i === 0,
          j + w >= w * h,
          j < w
        ], materials, defaultMaterial)
        const mesh = new THREE.Mesh(geometry, currMaterial)
        mesh.position.set(
          (j % w) * size - offsetWidth,
          size * i - offsetDepth,
          (j / w >> 0) * size - offsetHeight,
        )
        cube.add(mesh)
        this.smallCube.push(mesh)
      }
    }
    // 外壳
    const outside = new THREE.Mesh(
      new THREE.BoxGeometry(
        size * w + 0.01,
        size * d + 0.01,
        size * h + 0.01
      ),
      new THREE.MeshBasicMaterial({
        color: '#fff',
        opacity: 0,
        transparent: true
      })
    )
    cube.add(outside)
  }

  // 旋转逻辑
  rotateCube () {
    this.isRotating = true
    const sub = this.movePoint.sub(this.startPoint)
    let minAngle = Infinity, minIndex = 0, planeNormalIndex
    Object.values(Axes).forEach((vec3, index) => {
      const angle = sub.angleTo(vec3)
      if (vec3.angleTo(this.startPlane) === 0) {
        planeNormalIndex = index
      }
      if (angle < minAngle) {
        minAngle = angle
        minIndex = index
      }
    })
    const planeNormalKey = planeNormalIndex / 2 >> 0
    const planeNormal = AxesEnum[planeNormalKey]
    // console.log('平面法向量', planeNormal)
    const rotateAxisKey = minIndex / 2 >> 0
    const rotateDirection = ['x+', 'x-', 'y+', 'y-', 'z+', 'z-'][minIndex]
    // console.log('旋转方向', rotateDirection)
    const cubePosition = XYZ_VALUE ^ rotateAxisKey ^ planeNormalKey
    const site = AxesEnum[cubePosition]
    // console.log('位置 ===', site)
    let vec3
    if (planeNormal === 'z') {
      if (rotateDirection === 'y-') vec3 = Axes['x-']
      if (rotateDirection === 'y+') vec3 = Axes['x+']
      if (rotateDirection === 'x-') vec3 = Axes['y+']
      if (rotateDirection === 'x+') vec3 = Axes['y-']
    }
    if (planeNormal === 'x') {
      if (rotateDirection === 'y-') vec3 = Axes['z+']
      if (rotateDirection === 'y+') vec3 = Axes['z-']
      if (rotateDirection === 'z+') vec3 = Axes['y+']
      if (rotateDirection === 'z-') vec3 = Axes['y-']
    }
    if (planeNormal === 'y') {
      if (rotateDirection === 'x+') vec3 = Axes['z+']
      if (rotateDirection === 'x-') vec3 = Axes['z-']
      if (rotateDirection === 'z+') vec3 = Axes['x-']
      if (rotateDirection === 'z-') vec3 = Axes['x+']
    }
    if (!vec3) return this.clearState()
    this.smallCube.forEach(item => {
      if (this.touchCube.position[site] === item.position[site]) {
        this.moveCube(item, vec3)
      }
    })
  }

  clearState () {
    this.isRotating = false
    this.startPoint = null
    this.movePoint = null
  }

  // 移动小方块
  moveCube (cube, vec3) {
    let prev = 0, data = { progress: 0 }
    anime({
      targets: data,
      duration: 300,
      progress: 1,
      easing: 'easeOutQuad',
      update: () => {
        const interval = data.progress - prev
        prev = data.progress
        const matrix = rotateAroundWorldAxis(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(-vec3.x, -vec3.y, -vec3.z),
          interval * Math.PI / 2
        )
        cube.applyMatrix4(matrix)
      },
      complete: () => {
        const p = cube.position
        cube.position.set(Math.round(p.x), Math.round(p.y), Math.round(p.z))
        this.clearState()
      }
    })
  }

  onMouseDown (e) {
    this.onMouseMove(e)
    // 旋转
    if (this.intersect1 && this.intersect2 && !this.isRotating) {
      // 起始点
      this.startPoint = this.intersect1.point
      // 起始平面
      this.startPlane = this.intersect1.face.normal
      // 触摸的小方块
      this.touchCube = this.intersect2.object
    }
  }

  onMouseMove (e) {
    const x = (e.touches ? e.touches[0] : e).clientX
    const y = (e.touches ? e.touches[0] : e).clientY
    this.mouse.x = (x / this.width - 0.5) * 2
    this.mouse.y = -(y / this.height - 0.5) * 2
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects = this.raycaster.intersectObjects(this.cube.children)
    this.intersect1 = intersects[0]
    this.intersect2 = intersects[1]

    if (this.intersect1 && !this.isRotating && this.startPoint) {
      this.movePoint = this.intersect1.point
      if (this.movePoint.distanceTo(this.startPoint) > this.cubeSize / 5) {
        this.rotateCube()
      }
    }
  }

  onMouseUp (e) {
    // this.startPoint = null
    // this.movePoint = null
  }

  initDebug () {
    pane.addInput(debug, 'level', {
      label: '魔方难度',
      options: {
        '二阶': 2,
        '三阶': 3,
        '四阶': 4,
        '五阶': 5,
        '六阶': 6,
        '七阶': 7,
      }
    }).on('change', (ev) => {
      const lev = ev.value
      this.initCube(lev)
      this.camera.position.set(lev * 5, lev * 5, lev * 5)
      this.camera.lookAt(0, 0, 0)
    })
  }
}

new App()
