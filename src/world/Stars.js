import * as THREE from 'three'
import {
  STAR_NEAR_COUNT, STAR_NEAR_RADIUS, STAR_NEAR_SIZE,
  STAR_FAR_COUNT,  STAR_FAR_RADIUS,  STAR_FAR_SIZE,
} from '../constants.js'

function makeLayer(count, radius, size, color) {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const phi   = Math.acos(2 * Math.random() - 1)
    const theta = Math.random() * Math.PI * 2
    positions[i * 3]     = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return new THREE.Points(geo, new THREE.PointsMaterial({ color, size, sizeAttenuation: false }))
}

/** @param {THREE.Scene} scene */
export function addStars(scene) {
  scene.add(makeLayer(STAR_NEAR_COUNT, STAR_NEAR_RADIUS, STAR_NEAR_SIZE, 0xc0d0f0))
  scene.add(makeLayer(STAR_FAR_COUNT,  STAR_FAR_RADIUS,  STAR_FAR_SIZE,  0xffffff))
}
