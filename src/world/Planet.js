import * as THREE from 'three'
import { fbm } from '../utils/math.js'
import {
  PLANET_RADIUS,
  TERRAIN_SUBDIV, TERRAIN_DISP_BASE, TERRAIN_DISP_AMP, TERRAIN_FBM_OCTAVES,
  TERRAIN_COLOR_OFFSET, TERRAIN_COLOR_RANGE,
} from '../constants.js'

const COLOR_LOW  = new THREE.Color(0x1e5c25)
const COLOR_MID  = new THREE.Color(0x4a8c38)
const COLOR_HIGH = new THREE.Color(0x8c7a5c)

function displaceTerrain(geo) {
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
    const nx = x / PLANET_RADIUS, ny = y / PLANET_RADIUS, nz = z / PLANET_RADIUS
    const d  = TERRAIN_DISP_BASE + fbm(nx, ny, nz, TERRAIN_FBM_OCTAVES) * TERRAIN_DISP_AMP
    pos.setXYZ(i, x + nx * d, y + ny * d, z + nz * d)
  }
  geo.computeVertexNormals()
}

function assignVertexColors(geo) {
  const pos    = geo.attributes.position
  const colors = new Float32Array(pos.count * 3)
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
    const r = Math.sqrt(x * x + y * y + z * z)
    const t = Math.max(0, Math.min(1, (r - PLANET_RADIUS - TERRAIN_COLOR_OFFSET) / TERRAIN_COLOR_RANGE))
    const c = t < 0.5
      ? COLOR_LOW.clone().lerp(COLOR_MID, t * 2)
      : COLOR_MID.clone().lerp(COLOR_HIGH, (t - 0.5) * 2)
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
}

/**
 * Builds and adds the planet mesh to the scene.
 * Atmosphere is intentionally NOT added here — buildAtmosphere() in
 * sky/AtmosphereShader.js owns that so it can use a proper Fresnel shader.
 *
 * @param {THREE.Scene} scene
 */
export function buildPlanet(scene) {
  const geo = new THREE.IcosahedronGeometry(PLANET_RADIUS, TERRAIN_SUBDIV)
  displaceTerrain(geo)
  assignVertexColors(geo)

  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    vertexColors: true,
    flatShading:  true,
    roughness:    0.92,
    metalness:    0.0,
  }))
  mesh.receiveShadow = true
  scene.add(mesh)
}
