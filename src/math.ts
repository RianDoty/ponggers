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

export class AxisAngle {
  axis: Vector3
  angle: number

  constructor(axis, angle) {
    this.axis = axis
    this.angle = angle
  }

  static fromQuaternion(q: Quaternion) {
    if (q.w === 1) return new AxisAngle(new Vector3(1, 0, 0), 0)

    const scale = 1/Math.sqrt(1 - q.w*q.w)
    return new AxisAngle(
      new Vector3(q.x*scale, q.y*scale, q.z*scale),
      2 * Math.acos(q.w)
    )
  }
}


export class Quaternion {
  w: number
  x: number
  y: number
  z: number

  constructor(w: number, x:number, y: number, z: number) {
    this.w = w
    this.x = x
    this.y = y
    this.z = z
  }

  static fromVector3(v: Vector3) {
    return new Quaternion(0, v.x, v.y, v.z)
  }

  static lookAt(pos: Vector3, lookAt: Vector3) {
    const forward = Vector3.sub(lookAt, pos).unit()

    if (forward.x >= 0.999) {
      return new Quaternion(1,0,0,0)
    } else if (forward.x <= -0.999) {
      return new Quaternion(0,0,1,0)
    }

    const right = Vector3.cross(forward, new Vector3(0,1,0))
    
    return new Quaternion(
      1 + lookAt.x,
      right.x,
      right.y,
      right.z
    )
  }

  static fromAxisAngle(a: AxisAngle) {
    const half = a.angle/2
    const axis = a.axis
    const sinHalfAngle = Math.sin(half)

    return new Quaternion(
      Math.cos(half), 
      axis.x * sinHalfAngle,
      axis.y * sinHalfAngle, 
      axis.z * sinHalfAngle
    )
  }

  rot(q: Quaternion) {
    const tw = this.w
    const tx = this.x
    const ty = this.y
    const tz = this.z

    const qw = q.w
    const qx = q.x
    const qy = q.y
    const qz = q.z
    return new Quaternion(
      tw * qw - tx * qx - ty * qy - tz * qz,
      tw * qx + tx * qw + ty * qz - tz * qy,
      tw * qy - tx * qz + ty * qw + tz * qx,
      tw * qz + tx * qy - ty * qx + tz * qw,
    )
  }
}

export class Frame {
  pos: Vector3
  rot: Quaternion

  constructor(pos: Vector3, rot: Quaternion) {
    this.pos = pos
    this.rot = rot
  }

  static fromPoints(pos: Vector3, lookAt: Vector3) {
    return new Frame(pos, Quaternion.lookAt(pos, lookAt))
  }
}

export class Scene {
  objects: RenderObject[]

  constructor() {
    this.objects = []
  }

  addObject(object: RenderObject) {
    this.objects.push(object)
  }
}

export class RenderObject {
  pos: Vector3
  rot: Quaternion

  constructor() {
    this.pos = new Vector3(0,0,0)
  }
}

export class Cumera {
  scene: Scene

  //Position of the camera in 3d space
  pos: Vector3

  //Yes, this camera uses quaternions.
  //No, you will not come out of learning those sane.
  //All quaternions used as orientations are rotations of (1,0,0,0)
  rot: Quaternion

  constructor(
    position: Vector3,
    lookAt: Vector3
  ) {
    this.pos = position

    const unit = lookAt.unit()
  }

  setScene(scene: Scene) {
    this.scene = scene
  }
}