import * as THREE from 'three'
import { fbm } from '../utils/math.js'
import {
  PLANET_RADIUS,
  TERRAIN_DISP_BASE, TERRAIN_DISP_AMP, TERRAIN_FBM_OCTAVES,
  ROCK_COUNT, ROCK_SIZE_MIN, ROCK_SIZE_VAR,
  TREE_COUNT, TREE_SURFACE_OFFSET,
} from '../constants.js'

const _worldY = new THREE.Vector3(0, 1, 0)
const _spinQ  = new THREE.Quaternion()

/** Rotate an object so its local +Y aligns with surfaceDir, plus random spin */
function alignToSurface(obj, surfaceDir, randomSpin = false) {
  obj.quaternion.setFromUnitVectors(_worldY, surfaceDir)
  if (randomSpin) {
    _spinQ.setFromAxisAngle(surfaceDir, Math.random() * Math.PI * 2)
    obj.quaternion.premultiply(_spinQ)
  }
}

/** Returns a unit-sphere direction from spherical coordinates */
function sphereDir(phi, theta) {
  return new THREE.Vector3(
    Math.sin(phi) * Math.cos(theta),
    Math.sin(phi) * Math.sin(theta),
    Math.cos(phi),
  )
}

/**
 * Approximate terrain radius at a unit-sphere direction.
 * Uses the same constants as Planet.js so props sit flush on the surface.
 */
function terrainRadius(dir) {
  const h = fbm(dir.x, dir.y, dir.z, TERRAIN_FBM_OCTAVES)
  return PLANET_RADIUS + TERRAIN_DISP_BASE + h * TERRAIN_DISP_AMP
}

/** @param {THREE.Scene} scene */
export function addRocks(scene) {
  const mat = new THREE.MeshStandardMaterial({ color: 0x484c58, flatShading: true, roughness: 0.95 })
  for (let i = 0; i < ROCK_COUNT; i++) {
    const phi   = Math.acos(2 * Math.random() - 1)
    const theta = Math.random() * Math.PI * 2
    const dir   = sphereDir(phi, theta)
    const rockRadius = ROCK_SIZE_MIN + Math.random() * ROCK_SIZE_VAR
    const rock  = new THREE.Mesh(
      new THREE.IcosahedronGeometry(rockRadius, 0), mat)
    rock.position.copy(dir.clone().multiplyScalar(terrainRadius(dir) + rockRadius))
    alignToSurface(rock, dir, true)
    rock.castShadow = rock.receiveShadow = true
    scene.add(rock)
  }
}

const TRUNK_MAT = new THREE.MeshStandardMaterial({ color: 0x3d2b18, roughness: 0.9 })
const LEAF_MAT  = new THREE.MeshStandardMaterial({ color: 0x2a6030, flatShading: true, roughness: 0.8 })

/** @param {THREE.Scene} scene */
export function addTrees(scene) {
  for (let i = 0; i < TREE_COUNT; i++) {
    const phi   = Math.acos(2 * Math.random() - 1)
    const theta = Math.random() * Math.PI * 2
    const dir   = sphereDir(phi, theta)

    const group  = new THREE.Group()
    const trunk  = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.12, 0.6, 6), TRUNK_MAT)
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.1, 6), LEAF_MAT)
    canopy.position.y = 0.7
    group.add(trunk, canopy)

    group.position.copy(dir.clone().multiplyScalar(terrainRadius(dir) + TREE_SURFACE_OFFSET))
    alignToSurface(group, dir)
    group.castShadow = true
    scene.add(group)
  }
}
