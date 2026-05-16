import * as THREE from 'three'

export function setupLights(scene) {
  // Hemisphere — gentle sky/ground tint on top of the flat ambient
  const hemi = new THREE.HemisphereLight(0xc8e0ff, 0x6a8060, 0.4)
  scene.add(hemi)

  // Strong flat ambient — ensures nothing ever goes dark
  const ambient = new THREE.AmbientLight(0xffffff, 0.8)
  scene.add(ambient)
  return { ambient }
}
