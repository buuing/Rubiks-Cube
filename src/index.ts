import * as THREE from 'three'
import anime from 'animejs'
import Base from './base'
import { rotateAroundWorldAxis, XYZ_VALUE, AxesEnum, AxesVec3, getFaceColor, colors } from './utils'
import { Pane } from 'tweakpane'

const pane: any = new Pane()
const debug = {
  level: 3,
  rotateTime: 300,
  gutter: 5,
  radius: 20,
  gutterColor: '#222',
  cubeSize: 2,
}

export default class CreepCube extends Base {
  intersect1: THREE.Intersection | null = null
  intersect2: THREE.Intersection | null = null
  startPlane: THREE.Vector3 | undefined = undefined
  startPoint: THREE.Vector3 | null = null
  movePoint: THREE.Vector3 | null = null
  touchCube: THREE.Mesh | null = null
  isRotating = false
  isShuffling = false
  isSolving = false
  mouse = new THREE.Vector2(0, 0)
  raycaster = new THREE.Raycaster()
  mesh!: THREE.Group
  children: THREE.Mesh[] = []
  coordinate: THREE.Vector3[] = []

  constructor (config = {
    level: 3
  }) {
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

  computeMaterial (
    rules: boolean[],
    materials: THREE.MeshBasicMaterial[],
    defaultMaterial: THREE.MeshBasicMaterial,
    logoMaterial?: THREE.MeshBasicMaterial,
  ) {
    return rules.map((item, index) => item ? logoMaterial || materials[index] : defaultMaterial)
  }

  async initCube () {
    this.mesh && this.scene.remove(this.mesh)
    this.children = []
    this.coordinate = []
    const mesh = this.mesh = new THREE.Group()
    this.scene.add(mesh)
    // 小立方体
    const { level, gutter, radius, cubeSize: size } = debug
    const w = level, h = level, d = level
    const offsetWidth =  w * size / 2 - size / 2
    const offsetHeight = h * size / 2 - size / 2
    const offsetDepth = d * size / 2 - size / 2
    const geometry = new THREE.BoxGeometry(size, size, size)
    // 材质
    const materials = colors.map(color => {
      const canvas = getFaceColor(color, radius, gutter, debug.gutterColor)
      const texture = new THREE.Texture(canvas)
      texture.needsUpdate = true
      texture.minFilter = THREE.NearestFilter
      texture.generateMipmaps = false
      return new THREE.MeshBasicMaterial({ map: texture })
    })
    const defaultMaterial = new THREE.MeshBasicMaterial({ color: debug.gutterColor })
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < w * h; j++) {
        const index = i * w * h + j
        const currMaterial = this.computeMaterial([
          (j + 1) % w === 0,
          j % w === 0,
          i === d - 1,
          i === 0,
          j + w >= w * h,
          j < w,
        ], materials, defaultMaterial)
        const mesh = new THREE.Mesh(geometry, currMaterial)
        mesh.position.set(
          (j % w) * size - offsetWidth,
          size * i - offsetDepth,
          (j / w >> 0) * size - offsetHeight,
        )
        mesh.name = String(index)
        this.mesh.add(mesh)
        this.children.push(mesh)
        this.coordinate[index] = mesh.position.clone()
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
    mesh.add(outside)
    // // 自动打乱
    // this.shuffleCube()
  }

  // 旋转逻辑
  computeRotation () {
    const sub = this.movePoint?.sub(this.startPoint!)
    if (!sub) return
    let minAngle = Infinity, minIndex = 0, planeNormalIndex: number = NaN
    Object.values(AxesVec3).forEach((vec3, index) => {
      const angle = sub.angleTo(vec3)
      if (vec3.angleTo(this.startPlane!) === 0) {
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
    const rotationVector = ['x+', 'x-', 'y+', 'y-', 'z+', 'z-'][minIndex]
    // console.log('旋转向量', rotationVector)
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
    this.rotateCube(this.touchCube!, rotationAxis as keyof typeof AxesVec3, direction)
  }

  // 根据立方体索引反推层数
  getStoreyByIndex (axis: 'x' | 'y' | 'z', i: number) {
    const lev = debug.level
    const squa = lev ** 2
    const _k = lev - 1
    const rules = {
      x: (i: number) => _k - ((i % squa) % lev),
      y: (i: number) => _k - (i / squa >> 0),
      z: (i: number) => _k - ((i % squa) / lev >> 0)
    }
    return rules[axis](i)
  }

  // 根据层数获取立方体
  getCubesByStorey (axis: 'x' | 'y' | 'z', storey = 0, sort = 1) {
    const lev = debug.level
    const squa = lev ** 2
    const rules: {
      [key in typeof axis]: ((n: unknown, i: number) => boolean)[]
    } = {
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
    return this.children.filter(rule)
  }

  /**
   * 旋转逻辑
   */
  async rotateCube (touchCube: THREE.Mesh, rotationAxis: keyof typeof AxesVec3, direction: 1 | -1) {
    if (this.isRotating) return
    this.isRotating = true
    const vec3 = AxesVec3[rotationAxis]
    const axis = rotationAxis.slice(0, 1)
    if (!vec3) return this.clearState()
    const allPromise: Promise<void>[] = []
    this.children.forEach(item => {
      if (touchCube.position[axis] === item.position[axis]) {
        allPromise.push(this.moveCube(item, vec3, direction))
      }
    })
    await Promise.all(allPromise)
    this.clearState()
    this.resetCubes()
  }

  clearState () {
    this.isRotating = false
    this.startPoint = null
    this.movePoint = null
  }

  // 移动小方块
  moveCube (cube: THREE.Mesh, vec3: THREE.Vector3, direction: 1 | -1): Promise<void> {
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
          cube.scale.set(1, 1, 1)
          cube.position.set(Math.round(p.x), Math.round(p.y), Math.round(p.z))
          resolve()
        }
      })
    })
  }

  resetCubes () {
    const map = {}
    const toString = (vec3: THREE.Vector3) => `x${vec3.x}y${vec3.y}z${vec3.z}`
    this.children.forEach(cube => map[toString(cube.position)] = cube)
    this.coordinate.forEach((vec3, index) => {
      this.children[index] = map[toString(vec3)]
    })
  }

  getMouseSite (e: MouseEvent | TouchEvent) {
    const x = (e['touches'] ? e['touches'][0] : e).clientX
    const y = (e['touches'] ? e['touches'][0] : e).clientY
    this.mouse.x = (x / this.width - 0.5) * 2
    this.mouse.y = -(y / this.height - 0.5) * 2
  }

  onMouseDown (e: MouseEvent | TouchEvent) {
    this.getMouseSite(e)
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects = this.raycaster.intersectObjects([this.mesh])
    this.controls.enabled = !intersects.length
    // 兼容移动端
    this.onMouseMove(e)
    // 旋转
    if (this.intersect1 && this.intersect2 && !this.isRotating) {
      // 起始点
      this.startPoint = this.intersect1.point
      // 起始平面
      this.startPlane = this.intersect1.face?.normal
      // 触摸的小方块
      this.touchCube = this.intersect2.object as THREE.Mesh
    }
  }

  onMouseMove (e: MouseEvent | TouchEvent) {
    if (!this.mesh) return
    this.getMouseSite(e)
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects = this.raycaster.intersectObjects(this.mesh.children)
    this.intersect1 = intersects[0]
    this.intersect2 = intersects[1]
    if (this.intersect1 && !this.isRotating && this.startPoint) {
      this.movePoint = this.intersect1.point
      if (this.movePoint.distanceTo(this.startPoint) > debug.cubeSize / 5) {
        this.computeRotation()
      }
    }
  }

  onMouseUp (e: MouseEvent | TouchEvent) {
    this.startPoint = null
    this.movePoint = null
    this.controls.enabled = true
  }

  async shuffleCube () {
    if (this.isShuffling) return
    this.isShuffling = true
    // this.controls.autoRotate = true
    this['inp1'].disabled = true
    this['btn1'].disabled = true
    this['btn2'].disabled = true
    debug.rotateTime = 150
    const count = debug.level * 5 + 10
    const children = this.children.slice()
    for (let i = 0; i < count; i++) {
      const axis = ['x', 'y', 'z'][i % 3]
      await this.rotateCube(
        children[Math.random() * children.length >> 0],
        `${axis}${Math.random() - 0.5 > 0 ? '+' : '-'}` as keyof typeof AxesVec3,
        Math.random() - 0.5 > 0 ? 1 : -1
      )
    }
    this.isShuffling = false
    // this.controls.autoRotate = false
    this['inp1'].disabled = false
    this['btn1'].disabled = false
    this['btn2'].disabled = false
    debug.rotateTime = 300
  }

  initDebug () {
    const f1 = pane.addFolder({ title: '参数' })
    this['inp1'] = f1.addInput(debug, 'level', {
      label: '难度',
      options: {
        '二阶': 2,
        '三阶': 3,
        '四阶': 4,
        '五阶': 5,
        '六阶': 6,
        '七阶': 7,
      }
    }).on('change', (ev: any) => {
      const lev = ev.value
      this.initCube()
      this.camera.position.set(lev * 5, lev * 5, lev * 5)
      this.camera.lookAt(0, 0, 0)
    })
    f1.addInput(debug, 'radius', {
      label: '圆角',
      min: 0,
      max: 100,
    }).on('change', () => {
      this.initCube()
    })
    f1.addInput(debug, 'gutter', {
      label: '缝隙',
      min: 0,
      max: 50,
    }).on('change', () => {
      this.initCube()
    })
    f1.addInput(debug, 'gutterColor', {
      label: '缝隙颜色',
    }).on('change', () => {
      this.initCube()
    })
    const f2 = pane.addFolder({ title: '操作' })
    this['btn1'] = f2.addButton({
      title: 'Reset 重置',
    }).on('click', () => {
      this.initCube()
    })
    this['btn2'] = f2.addButton({
      title: 'Shuffle 打乱',
    }).on('click', () => {
      this.shuffleCube()
    })
    this['btn3'] = f2.addButton({
      title: 'Solve 还原',
      disabled: true
    }).on('click', () => {
      this.shuffleCube()
    })
    // f2.addButton({ title: 'R' }).on('click', () => {
    //   this.rotateCube(this.children[26], 'x+', 1)
    // })
    // f2.addButton({ title: 'R\'' }).on('click', () => {
    //   this.rotateCube(this.children[26], 'x+', -1)
    // })
    // f2.addButton({ title: 'L' }).on('click', () => {
    //   this.rotateCube(this.children[24], 'x-', 1)
    // })
    // f2.addButton({ title: 'L\'' }).on('click', () => {
    //   this.rotateCube(this.children[24], 'x-', -1)
    // })
    // f2.addButton({ title: 'U' }).on('click', () => {
    //   this.rotateCube(this.children[26], 'y+', 1)
    // })
    // f2.addButton({ title: 'U\'' }).on('click', () => {
    //   this.rotateCube(this.children[26], 'y+', -1)
    // })
    // f2.addButton({ title: 'D' }).on('click', () => {
    //   this.rotateCube(this.children[8], 'y-', 1)
    // })
    // f2.addButton({ title: 'D\'' }).on('click', () => {
    //   this.rotateCube(this.children[8], 'y-', -1)
    // })
    // f2.addButton({ title: 'F' }).on('click', () => {
    //   this.rotateCube(this.children[26], 'z+', 1)
    // })
    // f2.addButton({ title: 'F\'' }).on('click', () => {
    //   this.rotateCube(this.children[26], 'z+', -1)
    // })
    // f2.addButton({ title: 'B' }).on('click', () => {
    //   this.rotateCube(this.children[20], 'z-', 1)
    // })
    // f2.addButton({ title: 'B\'' }).on('click', () => {
    //   this.rotateCube(this.children[20], 'z-', -1)
    // })
    // f2.addButton({ title: 'x' }).on('click', async () => {
    //   if (this.isRotating) return
    //   this.isRotating = true
    //   const vec3 = AxesVec3['x+']
    //   const direction = 1
    //   const allPromise: Promise<void>[] = []
    //   this.children.forEach(item => {
    //     allPromise.push(this.moveCube(item, vec3, direction))
    //   })
    //   await Promise.all(allPromise)
    //   this.isRotating = false
    //   this.clearState()
    //   this.resetCubes()
    // })
  }
}
