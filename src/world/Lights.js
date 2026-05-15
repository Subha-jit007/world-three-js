import * as THREE from 'three'
import { AMB_INTENSITY } from '../constants.js'

export function setupLights(scene) {
  // Hemisphere — sky blue top, warm ground bounce below
  const hemi = new THREE.HemisphereLight(0x87ceeb, 0x4a6741, 0.5)
  scene.add(hemi)

  // Cool fill from opposite side — softens harsh shadows
  const fill = new THREE.DirectionalLight(0x8090cc, 0.4)
  fill.position.set(-100, 50, -80)
  scene.add(fill)

  // DayNight drives this each frame; returned so main.js passes it to DayNight
  const ambient = new THREE.AmbientLight(0x404080, AMB_INTENSITY)
  scene.add(ambient)
  return { ambient }
}
