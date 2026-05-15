import * as THREE from 'three'
import {
  DUST_COUNT,
  DUST_LIFE_DECAY, DUST_DRAG,
  DUST_SPREAD_MIN, DUST_SPREAD_VAR,
  DUST_LIFT_MIN,   DUST_LIFT_VAR,
  DUST_LIFE_MIN,   DUST_LIFE_VAR,
} from '../constants.js'

const _spread = new THREE.Vector3()

/**
 * World-space dust puffs spawned on walk, jump, and landing.
 * Uses a fixed-size ring buffer of particles.
 */
export class Dust {
  /** @param {THREE.Scene} scene */
  constructor(scene) {
    this._particles = Array.from({ length: DUST_COUNT }, () => ({
      pos: new THREE.Vector3(), vel: new THREE.Vector3(), life: 0, maxLife: 1,
    }))
    this._head = 0

    this._posBuffer = new Float32Array(DUST_COUNT * 3)
    this._geo       = new THREE.BufferGeometry()
    this._geo.setAttribute('position', new THREE.BufferAttribute(this._posBuffer, 3))

    scene.add(new THREE.Points(
      this._geo,
      new THREE.PointsMaterial({
        color: 0xc8b89a, size: 0.07, sizeAttenuation: true,
        transparent: true, opacity: 0.7, depthWrite: false,
      }),
    ))
  }

  /**
   * Emit `count` particles at `origin`, spreading tangentially.
   * @param {THREE.Vector3} origin
   * @param {THREE.Vector3} surfaceUp  unit vector away from planet center
   * @param {number}        count
   */
  spawn(origin, surfaceUp, count) {
    for (let i = 0; i < count; i++) {
      const p = this._particles[this._head % DUST_COUNT]
      this._head++
      p.pos.copy(origin)
      _spread.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
        .projectOnPlane(surfaceUp).normalize()
        .multiplyScalar(DUST_SPREAD_MIN + Math.random() * DUST_SPREAD_VAR)
      p.vel.copy(surfaceUp)
        .multiplyScalar(DUST_LIFT_MIN + Math.random() * DUST_LIFT_VAR)
        .add(_spread)
      p.maxLife = DUST_LIFE_MIN + Math.random() * DUST_LIFE_VAR
      p.life    = p.maxLife
    }
  }

  /** Advance simulation and upload positions to GPU */
  update() {
    for (let i = 0; i < DUST_COUNT; i++) {
      const p = this._particles[i]
      if (p.life > 0) {
        p.life -= DUST_LIFE_DECAY
        p.pos.add(p.vel)
        p.vel.multiplyScalar(DUST_DRAG)
      }
      this._posBuffer[i * 3]     = p.pos.x
      this._posBuffer[i * 3 + 1] = p.pos.y
      this._posBuffer[i * 3 + 2] = p.pos.z
    }
    this._geo.attributes.position.needsUpdate = true
  }
}
