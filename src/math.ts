export class Vector3 {
  x: number
  y: number
  z: number

  constructor(x:number, y:number, z:number) {
    this.x = x
    this.y = y
    this.z = z
  }

  static add(v1: Vector3, v2: Vector3) {
    return new Vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z)
  }

  static sub(v1: Vector3, v2: Vector3) {
    return new Vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z)
  }

  static dot(v1: Vector3, v2: Vector3) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z
  }

  static cross(v1: Vector3, v2: Vector3) {
    return new Vector3(
      v1.y * v2.z - v1.z * v2.y,
      v1.z * v2.x - v1.x * v2.z,
      v1.x * v2.y - v1.y * v2.x
    )
  }

  scale(s: number) {
    return new Vector3(this.x * s, this.y * s, this.z * s)
  }

  magnitude() {
    return Math.sqrt(this.x**2 + this.y**2 + this.z**2)
  }

  unit() {
    return this.scale(1/this.magnitude())
  }
}