import * as THREE from 'three'
import { CAM_DIST, CAM_HEIGHT, CAM_SPRING_K, CAM_SPRING_D, CAM_UP_LERP } from '../constants.js'

const HEAD_HEIGHT = 1.0  // look at character's head, not feet

export class SpringCamera {
  /** @param {THREE.PerspectiveCamera} camera */
  constructor(camera) {
    this._camera = camera
    this._pos    = new THREE.Vector3()
    this._vel    = new THREE.Vector3()
    this._up     = new THREE.Vector3(0, 1, 0)
    this._lookAt = new THREE.Vector3()
  }

  reset(position) {
    this._pos.copy(position)
    this._camera.position.copy(position)
  }

  update(playerPos, forward, surfaceUp) {
    // Low third-person: directly behind and slightly above
    const target = playerPos.clone()
      .addScaledVector(forward, -CAM_DIST)
      .addScaledVector(surfaceUp, CAM_HEIGHT)

    const force = target.clone().sub(this._pos).multiplyScalar(CAM_SPRING_K)
    this._vel.add(force).multiplyScalar(CAM_SPRING_D)
    this._pos.add(this._vel)

    this._camera.position.copy(this._pos)
    this._up.lerp(surfaceUp, CAM_UP_LERP)
    this._camera.up.copy(this._up)

    // Look at head level so character fills the frame properly
    this._lookAt.copy(playerPos).addScaledVector(surfaceUp, HEAD_HEIGHT)
    this._camera.lookAt(this._lookAt)
  }
}
