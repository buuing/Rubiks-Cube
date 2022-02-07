import * as THREE from 'three'
import { LOGO } from './config'

export const rotateAroundWorldAxis = (origin: THREE.Vector3, vector: THREE.Vector3, radius: number) => {
  vector.normalize()
  const u = vector.x
  const v = vector.y
  const w = vector.z
  const a = origin.x
  const b = origin.y
  const c = origin.z
  const matrix4 = new THREE.Matrix4()
  matrix4.set(
    u * u + (v * v + w * w) * Math.cos(radius), u * v * (1 - Math.cos(radius)) - w * Math.sin(radius), u * w * (1 - Math.cos(radius)) + v * Math.sin(radius), (a * (v * v + w * w) - u * (b * v + c * w)) * (1 - Math.cos(radius)) + (b * w - c * v) * Math.sin(radius),
    u * v * (1 - Math.cos(radius)) + w * Math.sin(radius), v * v + (u * u + w * w) * Math.cos(radius), v * w * (1 - Math.cos(radius)) - u * Math.sin(radius), (b * (u * u + w * w) - v * (a * u + c * w)) * (1 - Math.cos(radius)) + (c * u - a * w) * Math.sin(radius),
    u * w * (1 - Math.cos(radius)) - v * Math.sin(radius), v * w * (1 - Math.cos(radius)) + u * Math.sin(radius), w * w + (u * u + v * v) * Math.cos(radius), (c * (u * u + v * v) - w * (a * u + b * v)) * (1 - Math.cos(radius)) + (a * v - b * u) * Math.sin(radius),
    0, 0, 0, 1
  ) 
  return matrix4
}

export enum AxesEnum { x, y, z }

export const XYZ_VALUE = 0 ^ 1 ^ 2

export const AxesVec3 = {
  'x+': new THREE.Vector3(1, 0, 0),
  'x-': new THREE.Vector3(-1, 0, 0),
  'y+': new THREE.Vector3(0, 1, 0),
  'y-': new THREE.Vector3(0, -1, 0),
  'z+': new THREE.Vector3(0, 0, 1),
  'z-': new THREE.Vector3(0, 0, -1)
}

const roundRectByArc = (ctx: CanvasRenderingContext2D, ...[x, y, w, h, r]: number[]) => {
  const min = Math.min(w, h), PI = Math.PI
  if (r > min / 2) r = min / 2
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arc(x + w - r, y + r, r, -PI / 2, 0)
  ctx.lineTo(x + w, y + h - r)
  ctx.arc(x + w - r, y + h - r, r, 0, PI / 2)
  ctx.lineTo(x + r, y + h)
  ctx.arc(x + r, y + h - r, r, PI / 2, PI)
  ctx.lineTo(x, y + r)
  ctx.arc(x + r, y + r, r, PI, -PI / 2)
  ctx.closePath()
}

export const colors = [
  '#3b81f5', // 蓝色
  '#029c56', // 绿色
  '#d94335', // 红色
  '#e66f00', // 橘色
  '#f3b30a', // 黄色
  '#f4f4f4', // 白色
]

export const getFaceColor = (
  color: string,
  radius = 10,
  gutter = 5,
  gutterColor = '#000',
  text = ''
): HTMLCanvasElement => {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = gutterColor
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = color
  roundRectByArc(ctx, gutter, gutter, size - gutter * 2, size - gutter * 2, radius)
  ctx.fill()
  if (text) {
    ctx.fillStyle = gutterColor
    const h = size / 2
    ctx.font = `${h}px Microsoft YaHei`
    ctx.textBaseline = 'top'
    const w = ctx.measureText(text).width
    ctx.fillText(text, size / 2 - w / 2, size / 2 - h / 2)
  }
  return canvas
  // else return new Promise((resolve, reject) => {
  //   const img = new Image()
  //   img.onload = () => {
  //     ctx.drawImage(img, 0, 0, size, size)
  //     resolve(canvas)
  //   }
  //   img.src = LOGO
  // })
}
