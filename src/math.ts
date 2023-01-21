class Vector3 {
  x: number
  y: number
  z: number

  constructor(x:number, y:number, z:number) {
    this.x = x
    this.y = y
    this.z = z
  }

  add(v: Vector3) {
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z)
  }

  sub(v: Vector3) {
    return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z)
  }
}

class Quaternion {
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

  prod(q: Quaternion) {
    return new Quaternion(
      this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z,
      this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y,
      this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x,
      this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w,
    )
  }
}

class Scene {
  objects: RenderObject[]

  constructor() {
    this.objects = []
  }

  addObject(object: RenderObject) {
    this.objects.push(object)
  }
}

class RenderObject {
  x: number;
  y: number;
  z: number;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }
}

class Cumera {
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
    this.x = position[0];
    this.y = position[1];
    this.z = position[2];

    const unit = 
  }

  setScene(scene: Scene) {
    this.scene = scene
  }
}