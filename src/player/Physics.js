import * as THREE from 'three'
import { fbm } from '../utils/math.js'
import {
  PLANET_RADIUS, PLAYER_RADIUS, GROUND_OFFSET,
  TERRAIN_DISP_BASE, TERRAIN_DISP_AMP, TERRAIN_FBM_OCTAVES,
  GRAVITY, WALK_SPEED, SPRINT_MULT, TURN_SPEED, JUMP_VEL,
  DUST_WALK_PROB,
} from '../constants.js'

/**
 * Handles all movement and gravity physics for the player.
 * Mutates `position` in place each tick.
 *
 * Callbacks (assign from outside):
 *   onWalkStep() — fired randomly while walking on ground
 *   onJump()     — fired on takeoff
 *   onLand()     — fired on touchdown
 */
export class Physics {
  constructor() {
    this.forward     = new THREE.Vector3(0, 0, -1)
    this.verticalVel = 0
    this.onGround    = true
    this.speed       = 0

    this.onWalkStep  = null
    this.onJump      = null
    this.onLand      = null

    this._prevPos    = new THREE.Vector3()
    this._jumpHeld   = false
  }

  /**
   * @param {THREE.Vector3} position — mutated in place
   * @param {import('./Controls').Controls} controls
   * @returns {{ surfaceUp: THREE.Vector3, walking: boolean }}
   */
  update(position, controls) {
    const wasOnGround = this.onGround
    const surfaceUp   = position.clone().normalize()

    // Re-project forward onto the tangent plane to remove drift
    this.forward.projectOnPlane(surfaceUp).normalize()
    const right = new THREE.Vector3().crossVectors(this.forward, surfaceUp).normalize()

    // ── Turn ──────────────────────────────────────────────────────────────
    if (controls.left)  this.forward.applyAxisAngle(surfaceUp,  TURN_SPEED)
    if (controls.right) this.forward.applyAxisAngle(surfaceUp, -TURN_SPEED)

    // ── Walk ──────────────────────────────────────────────────────────────
    const speed = WALK_SPEED * (controls.sprint ? SPRINT_MULT : 1)
    let walking = false

    if (controls.forward || controls.backward) {
      const dir   = controls.forward ? -1 : 1
      const angle = (speed / PLANET_RADIUS) * dir
      position.applyAxisAngle(right, angle)
      this.forward.applyAxisAngle(right, angle)
      walking = true
      if (this.onGround && Math.random() < DUST_WALK_PROB) this.onWalkStep?.()
    }

    // ── Jump — single impulse, no re-fire while Space held ────────────────
    if (controls.jump && this.onGround && !this._jumpHeld) {
      this.verticalVel = JUMP_VEL
      this.onGround    = false
      this._jumpHeld   = true
      this.onJump?.()
    }
    if (!controls.jump) this._jumpHeld = false

    // ── Terrain height at current (post-walk) position ────────────────────
    const posDir     = position.clone().normalize()
    const h          = fbm(posDir.x, posDir.y, posDir.z, TERRAIN_FBM_OCTAVES)
    const groundDist = PLANET_RADIUS + TERRAIN_DISP_BASE + h * TERRAIN_DISP_AMP + PLAYER_RADIUS + GROUND_OFFSET

    if (this.onGround) {
      // Grounded: snap directly to surface — no gravity, no oscillation
      position.setLength(groundDist)
      this.verticalVel = 0
    } else {
      // Airborne: accumulate gravity, cap fall speed to avoid tunnelling
      this.verticalVel = Math.max(this.verticalVel - GRAVITY, -1.5)
      const newDist    = position.length() + this.verticalVel

      if (newDist <= groundDist) {
        position.setLength(groundDist)
        this.verticalVel = 0
        if (!wasOnGround) this.onLand?.()
        this.onGround = true
      } else {
        position.setLength(Math.max(newDist, PLANET_RADIUS + 1))
      }
    }

    // ── Speed measurement ─────────────────────────────────────────────────
    this.speed = position.distanceTo(this._prevPos)
    this._prevPos.copy(position)

    return { surfaceUp: position.clone().normalize(), walking }
  }
}
