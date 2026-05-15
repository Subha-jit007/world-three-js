import * as THREE from 'three'
import { RIM_INTENSITY, AMB_INTENSITY } from '../constants.js'

/**
 * Adds static fill lights to the scene.
 * The sun's DirectionalLight is intentionally NOT here — Cosmos.js owns it
 * so it can track the rotating sun pivot and drive the day/night cycle.
 *
 * @param {THREE.Scene} scene
 */
export function setupLights(scene) {
  // Cool-toned rim light — provides fill on the shadowed side of the planet
  const rim = new THREE.DirectionalLight(0x4466cc, RIM_INTENSITY)
  rim.position.set(-60, -30, -40)
  scene.add(rim)

  // DayNight drives this each frame; returned so main.js can pass it along.
  const ambient = new THREE.AmbientLight(0x1a2440, AMB_INTENSITY)
  scene.add(ambient)
  return { ambient }
}
