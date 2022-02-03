import * as THREE from 'three'
import anime from 'animejs'
import Base from './base'
import { rotateAroundWorldAxis, XYZ_VALUE, AxesEnum, Axes, getCubeFace, colors } from './utils'
import { Pane } from 'tweakpane'

const pane = new Pane()
const debug = {
  level: 3,
  rotateTime: 300
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
  shuffleNum = 0

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
    window.addEventListener('touchend', this.onMouseUp.bind(this))
  }

  computeMaterial (logic, materials, defaultMaterial) {
    return logic.map((item, index) => item ? materials[index] : defaultMaterial)
  }

  initCube (level = 3) {
    this.cube && this.scene.remove(this.cube)
    this.smallCube = []
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
      // texture.generateMipmaps = false
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
  computeRotation () {
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
    const direction = planeNormalIndex % 2 === 0 ? 1 : -1
    const planeNormalKey = planeNormalIndex / 2 >> 0
    const planeNormal = AxesEnum[planeNormalKey]
    // console.log('平面法向量', planeNormal, planeNormalIndex)
    const rotateAxisKey = minIndex / 2 >> 0
    const rotationVector = ['x+', 'x-', 'y+', 'y-', 'z+', 'z-'][minIndex]
    // console.log('旋转向量', rotationVector)
    // const cubePosition = XYZ_VALUE ^ rotateAxisKey ^ planeNormalKey
    let rotationAxis
    if (planeNormal === 'x') {
      if (rotationVector === 'y-') rotationAxis = 'z+'
      if (rotationVector === 'y+') rotationAxis = 'z-'
      if (rotationVector === 'z+') rotationAxis = 'y+'
      if (rotationVector === 'z-') rotationAxis = 'y-'
    }
    if (planeNormal === 'y') {
      if (rotationVector === 'x+') rotationAxis = 'z+'
      if (rotationVector === 'x-') rotationAxis = 'z-'
      if (rotationVector === 'z+') rotationAxis = 'x-'
      if (rotationVector === 'z-') rotationAxis = 'x+'
    }
    if (planeNormal === 'z') {
      if (rotationVector === 'y-') rotationAxis = 'x-'
      if (rotationVector === 'y+') rotationAxis = 'x+'
      if (rotationVector === 'x-') rotationAxis = 'y+'
      if (rotationVector === 'x+') rotationAxis = 'y-'
    }
    if (!rotationAxis) return
    this.rotateCube(this.touchCube, rotationAxis, direction)
  }

  // 根据立方体索引反推层数
  getStoreyByIndex (axis, i) {
    console.log(axis)
    const lev = debug.level
    const squa = lev ** 2
    const _k = lev - 1
    const rules = {
      x: i => _k - ((i % squa) % lev),
      y: i => _k - (i / squa >> 0),
      z: i => _k - ((i % squa) / lev >> 0)
    }
    return rules[axis](i)
  }

  // 根据层数获取立方体
  getCubesByStorey (axis, storey = 0, sort = 1) {
    const lev = debug.level
    const squa = lev ** 2
    const rules = {
      x: [],
      y: [],
      z: [],
    }
    for (let k = 0; k < lev; k++) {
      const _k = lev - k - 1
      rules['x'][k] = (n, i) => i % lev === _k
      rules['y'][k] = (n, i) => i / squa >> 0 === _k
      rules['z'][k] = (n, i) => (i % 9) / lev >> 0 === _k
    }
    storey = sort > 0 ? storey : lev - storey - 1
    const rule = rules[axis][storey]
    return this.smallCube.filter(rule)
  }

  /**
   * 旋转逻辑
   */
  async rotateCube (touchCube, rotationAxis, direction) {
    if (this.isRotating) return
    this.isRotating = true
    const vec3 = Axes[rotationAxis]
    const axis = rotationAxis.slice(0, 1)
    if (!vec3) return this.clearState()
    const allPromise = []
    this.smallCube.forEach(item => {
      if (touchCube.position[axis] === item.position[axis]) {
        allPromise.push(this.moveCube(item, vec3, direction))
      }
    })
    await Promise.all(allPromise)
    this.clearState()
  }

  clearState () {
    this.isRotating = false
    this.startPoint = null
    this.movePoint = null
  }

  // 移动小方块
  moveCube (cube, vec3, direction) {
    return new Promise(resolve => {
      let prev = 0, data = { progress: 0 }
      anime({
        targets: data,
        duration: debug.rotateTime,
        progress: 1,
        easing: 'easeOutQuad',
        update: () => {
          const interval = data.progress - prev
          prev = data.progress
          const matrix = rotateAroundWorldAxis(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(-vec3.x * direction, -vec3.y * direction, -vec3.z * direction),
            interval * Math.PI / 2
          )
          cube.applyMatrix4(matrix)
        },
        complete: () => {
          const p = cube.position
          cube.position.set(Math.round(p.x), Math.round(p.y), Math.round(p.z))
          resolve()
        }
      })
    })
  }

  getMouseSite (e) {
    const x = (e.touches ? e.touches[0] : e).clientX
    const y = (e.touches ? e.touches[0] : e).clientY
    this.mouse.x = (x / this.width - 0.5) * 2
    this.mouse.y = -(y / this.height - 0.5) * 2
  }

  onMouseDown (e) {
    this.getMouseSite(e)
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects = this.raycaster.intersectObjects([this.cube])
    this.controls.enabled = !intersects.length
    // 兼容移动端
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
    if (!this.cube) return
    this.getMouseSite(e)
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects = this.raycaster.intersectObjects(this.cube.children)
    this.intersect1 = intersects[0]
    this.intersect2 = intersects[1]
    if (this.intersect1 && !this.isRotating && this.startPoint) {
      this.movePoint = this.intersect1.point
      if (this.movePoint.distanceTo(this.startPoint) > this.cubeSize / 5) {
        this.computeRotation()
      }
    }
  }

  onMouseUp (e) {
    this.startPoint = null
    this.movePoint = null
    this.controls.enabled = true
  }

  async shuffleCube () {
    this.controls.autoRotate = true
    this.inp1.disabled = true
    this.btn1.disabled = true
    this.btn2.disabled = true
    debug.rotateTime = 150
    const count = debug.level * 5 + 5
    for (let i = 0; i < count; i++) {
      const axis = ['x', 'y', 'z'][i % 3]
      await this.rotateCube(
        this.smallCube[Math.random() * this.smallCube.length >> 0],
        `${axis}${Math.random() - 0.5 > 0 ? '+' : '-'}`,
        Math.random() - 0.5 > 0 ? 1 : -1
      )
    }
    this.controls.autoRotate = false
    this.inp1.disabled = false
    this.btn1.disabled = false
    this.btn2.disabled = false
    debug.rotateTime = 300
  }

  initDebug () {
    const f1 = pane.addFolder({ title: '选项' })
    this.inp1 = f1.addInput(debug, 'level', {
      label: '难度',
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
    const f2 = pane.addFolder({ title: '操作' })
    this.btn1 = f2.addButton({
      title: '还原',
    }).on('click', () => {
      this.initCube(debug.level)
    })
    this.btn2 = f2.addButton({
      title: '打乱',
    }).on('click', () => {
      this.shuffleCube()
    })
  }
}

new App()
