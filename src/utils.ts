import { resolve } from 'path/posix'
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

export const XYZ_VALUE = 0 ^ 1 ^ 2

export const AxesEnum = {
  0: 'x',
  1: 'y',
  2: 'z',
  'x': 0,
  'y': 1,
  'z': 2,
}

export const Axes = {
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
  '#4772f5',
  '#359049',
  '#c7472e',
  '#ee6c15',
  '#f4c812',
  '#e5e5e5',
]

export const getFaceColor = (
  color: string,
  gutter = 5,
  radius = 10,
  logo = false
): HTMLCanvasElement | Promise<HTMLCanvasElement> => {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = color
  roundRectByArc(ctx, gutter, gutter, size - gutter * 2, size - gutter * 2, radius)
  ctx.fill()
  if (!logo) return canvas
  else return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size)
      resolve(canvas)
    }
    img.src = LOGO
  })
}
