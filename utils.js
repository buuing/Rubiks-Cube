
export const rotateAroundWorldAxis = (origin, vector, radius) => {
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
