import * as THREE from 'three'
import { CAM_DIST, CAM_HEIGHT, CAM_SPRING_K, CAM_SPRING_D, CAM_UP_LERP } from '../constants.js'

export class SpringCamera {
  /** @param {THREE.PerspectiveCamera} camera */
  constructor(camera) {
    this._camera = camera
    this._pos    = new THREE.Vector3()
    this._vel    = new THREE.Vector3()
    this._up     = new THREE.Vector3(0, 1, 0)
  }

  /** Place instantly — call once before the first tick */
  reset(position) {
    this._pos.copy(position)
    this._camera.position.copy(position)
  }

  /**
   * @param {THREE.Vector3} playerPos
   * @param {THREE.Vector3} forward    player's forward direction
   * @param {THREE.Vector3} surfaceUp  unit vector pointing away from planet
   */
  update(playerPos, forward, surfaceUp) {
    const target = playerPos.clone()
      .addScaledVector(forward, -CAM_DIST)      // behind the player
      .addScaledVector(surfaceUp, CAM_HEIGHT)   // elevated above surface

    const force = target.clone().sub(this._pos).multiplyScalar(CAM_SPRING_K)
    this._vel.add(force).multiplyScalar(CAM_SPRING_D)
    this._pos.add(this._vel)

    this._camera.position.copy(this._pos)
    this._up.lerp(surfaceUp, CAM_UP_LERP)
    this._camera.up.copy(this._up)
    this._camera.lookAt(playerPos)
  }
}
