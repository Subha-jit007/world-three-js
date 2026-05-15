import * as THREE from 'three'
import { PLANET_RADIUS } from '../constants.js'

// Scratch vectors — allocated once, reused each frame
const _norm  = new THREE.Vector3()
const _north = new THREE.Vector3()
const _east  = new THREE.Vector3()

/**
 * Derives HUD telemetry from the current player state.
 * Returns a plain data object so HUD.js stays free of Three.js types.
 *
 * @param {THREE.Vector3} playerPos
 * @param {THREE.Vector3} forward
 * @param {boolean}       onGround
 * @param {number}        speed     units per tick
 * @returns {{ altitude, speed, lat, lon, onGround, bearing }}
 */
export function computeHUDData(playerPos, forward, onGround, speed) {
  _norm.copy(playerPos).normalize()

  const lat = Math.asin(Math.max(-1, Math.min(1, _norm.y))) * 180 / Math.PI
  const lon = Math.atan2(_norm.z, _norm.x) * 180 / Math.PI

  // Compass bearing: angle of forward relative to planet-north in the tangent plane
  _north.set(0, 1, 0).projectOnPlane(_norm).normalize()
  _east.crossVectors(_norm, _north).normalize()
  const bearing = Math.atan2(forward.dot(_east), forward.dot(_north)) * 180 / Math.PI

  return {
    altitude: playerPos.length() - PLANET_RADIUS,
    speed,
    lat,
    lon,
    onGround,
    bearing,
  }
}
