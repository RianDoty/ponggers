import { describe, it, expect } from 'vitest'
import { Quaternion, Vector3 } from './math'

describe('Vector3', () => {
    it('adds', () => {
        const v1 = new Vector3(1,2,3)
        const v2 = new Vector3(1,4,7)

        const v3 = Vector3.add(v1,v2)
        expect(v3).toEqual(new Vector3(2,6,10))
    })
    it('subtracts', () => {
        const v1 = new Vector3(1,2,3)
        const v2 = new Vector3(1,4,7)

        const v3 = Vector3.sub(v1,v2)
        expect(v3).toEqual(new Vector3(0,-2,-4))
    })
    it('scales', () => {
        const v1 = new Vector3(1,2,3)
        const scale = 5

        const v2 = v1.scale(scale)
        expect(v2).toEqual(new Vector3(5,10,15))
    })
})

describe('Quaternions', () => {
    it('rotates', () => {
        const identity = new Quaternion(1,0,0,0)
        const sqrt22 = Math.sqrt(2)/2 //50% rotation in quaternion-land
        const rotation = new Quaternion(sqrt22, 0, sqrt22, 0) //Rotation 90* around the Y axis
        const final = new Quaternion(0, 0, 1, 0) //Rotation 180* around the Y axis

        //Rotating the identity by should spit out the rotation again
        const q2 = identity.rot(rotation)
        expect(q2.w).toBeCloseTo(rotation.w)
        expect(q2.x).toBeCloseTo(rotation.x)
        expect(q2.y).toBeCloseTo(rotation.y)
        expect(q2.z).toBeCloseTo(rotation.z)

        //Rotating again should double the effective rotation
        const q3 = q2.rot(rotation)
        expect(q3.w).toBeCloseTo(final.w)
        expect(q3.x).toBeCloseTo(final.x)
        expect(q3.y).toBeCloseTo(final.y)
        expect(q3.z).toBeCloseTo(final.z)
    })
})