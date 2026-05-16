import * as THREE from 'three'
import {
  PLANET_RADIUS, PLAYER_RADIUS, GROUND_OFFSET,
  BODY_TOP_Y, BODY_HEIGHT, VISOR_Y,
  LEG_X, LEG_REST_Y, FOOT_REST_Y, FOOT_Z,
  ANIM_STEP_FREQ, ANIM_STEP_AMP,
  VISOR_GLOW_BASE, VISOR_GLOW_AMP, VISOR_GLOW_FREQ,
} from '../constants.js'

const START_Y = PLANET_RADIUS + PLAYER_RADIUS + GROUND_OFFSET

/**
 * The player's visual representation — a humanoid figure with
 * animated legs and a glowing visor.
 */
export class Player {
  /** @param {THREE.Scene} scene */
  constructor(scene) {
    this.group      = new THREE.Group()
    this._stepPhase = 0
    this._buildMesh()
    this.group.position.set(0, START_Y, 0)
    scene.add(this.group)
  }

  /** Shorthand so callers don't reach into .group */
  get position() { return this.group.position }

  _buildMesh() {
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x88a0cc, roughness: 0.35, metalness: 0.25,
      emissive: new THREE.Color(0x111111), emissiveIntensity: 0.2,
    })
    const legMat  = new THREE.MeshStandardMaterial({
      color: 0x4a5e80, roughness: 0.5, metalness: 0.1,
      emissive: new THREE.Color(0x080810), emissiveIntensity: 0.2,
    })
    const footMat = new THREE.MeshStandardMaterial({
      color: 0x2a3a58, roughness: 0.6,
      emissive: new THREE.Color(0x080810), emissiveIntensity: 0.2,
    })
    this._visorMat = new THREE.MeshStandardMaterial({
      color: 0x60b0ff, emissive: 0x1040a0, roughness: 0.1, metalness: 0.8,
    })

    const bodyTop = new THREE.Mesh(new THREE.SphereGeometry(PLAYER_RADIUS, 20, 14), bodyMat)
    bodyTop.position.y = BODY_TOP_Y

    const bodyMid = new THREE.Mesh(
      new THREE.CylinderGeometry(PLAYER_RADIUS, PLAYER_RADIUS * 0.8, BODY_HEIGHT, 20), bodyMat)

    const visor = new THREE.Mesh(
      new THREE.SphereGeometry(PLAYER_RADIUS * 0.55, 16, 10, 0, Math.PI), this._visorMat)
    visor.position.set(0, VISOR_Y, PLAYER_RADIUS * 0.6)
    visor.rotation.y = Math.PI

    this._legL  = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.55, 8), legMat)
    this._legR  = this._legL.clone()
    this._footL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.3), footMat)
    this._footR = this._footL.clone()

    this._legL.position.set(-LEG_X, LEG_REST_Y,   0)
    this._legR.position.set( LEG_X, LEG_REST_Y,   0)
    this._footL.position.set(-LEG_X, FOOT_REST_Y, FOOT_Z)
    this._footR.position.set( LEG_X, FOOT_REST_Y, FOOT_Z)

    // Dedicated light above the character — always lit from above regardless of sun
    const charLight = new THREE.PointLight(0xffffff, 0.8, 30)
    charLight.position.set(0, 5, 0)

    this.group.add(bodyTop, bodyMid, visor, this._legL, this._legR, this._footL, this._footR, charLight)
    ;[bodyTop, bodyMid, visor, this._legL, this._legR, this._footL, this._footR]
      .forEach(m => { m.castShadow = true })
  }

  /**
   * Align the group so local +Y = surfaceUp, local -Z = forward.
   * @param {THREE.Vector3} surfaceUp
   * @param {THREE.Vector3} forward
   */
  orient(surfaceUp, forward) {
    const zAxis = forward.clone().negate()
    const xAxis = new THREE.Vector3().crossVectors(surfaceUp, zAxis).normalize()
    this.group.quaternion.setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(xAxis, surfaceUp, zAxis)
    )
  }

  /**
   * Animate legs while walking, pulse visor glow every frame.
   * @param {boolean} walking
   * @param {number}  speed    physics speed (units/tick)
   * @param {number}  time     performance.now()
   */
  animate(walking, speed, time) {
    if (walking) {
      this._stepPhase += speed * ANIM_STEP_FREQ
      const s = Math.sin(this._stepPhase) * ANIM_STEP_AMP
      this._legL.position.y  = LEG_REST_Y  + s
      this._legR.position.y  = LEG_REST_Y  - s
      this._footL.position.y = FOOT_REST_Y + s
      this._footR.position.y = FOOT_REST_Y - s
    } else {
      this._legL.position.y  = this._legR.position.y  = LEG_REST_Y
      this._footL.position.y = this._footR.position.y = FOOT_REST_Y
    }
    this._visorMat.emissiveIntensity = VISOR_GLOW_BASE + VISOR_GLOW_AMP * Math.sin(time * VISOR_GLOW_FREQ)
  }
}
