import * as THREE from 'three'
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
import { PLANET_RADIUS, TERRAIN_DISP_BASE } from '../constants.js'

const SURFACE_R = PLANET_RADIUS + TERRAIN_DISP_BASE + 3  // comfortably above average terrain

export const ZONE_DEFS = [
  { id: 'projects',    label: 'PROJECTS',    lat: 75, lon: 0,   desc: 'Selected work — web, 3D, and interactive experiments.', color: 0x00ffcc },
  { id: 'about',       label: 'ABOUT',        lat: 75, lon: 90,  desc: 'Developer & designer. I build things for the web.',      color: 0xaaccff },
  { id: 'photography', label: 'PHOTOGRAPHY',  lat: 75, lon: 180, desc: 'Moments captured through the lens.',                    color: 0xff88aa },
  { id: 'contact',     label: 'CONTACT',      lat: 75, lon: 270, desc: 'Let\'s talk. Find me online or drop a message.',         color: 0xffd700 },
]

// lat/lon (degrees) → XYZ on sphere of given radius
function toSphere(lat, lon, r) {
  const phi   = (90 - lat) * Math.PI / 180
  const theta = lon * Math.PI / 180
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  )
}

// Orient a group so its local +Y = surfaceUp
function alignToNormal(group, pos, up) {
  group.position.copy(pos)
  group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), up)
}

function glowRing(color) {
  const mat = new THREE.MeshStandardMaterial({
    color, emissive: color, emissiveIntensity: 1.5,
    transparent: true, opacity: 0.75,
    side: THREE.DoubleSide, depthWrite: false,
  })
  const ring = new THREE.Mesh(new THREE.RingGeometry(16, 19, 64), mat)
  ring.rotation.x = -Math.PI / 2
  ring.position.y = 0.1
  return ring
}

function zoneLabel(text) {
  const div = document.createElement('div')
  div.className = 'zone-label'
  div.textContent = text
  const obj = new CSS2DObject(div)
  return obj
}

// ── Zone builders ────────────────────────────────────────────────────────────

function buildProjects(up, scene) {
  const g = new THREE.Group()

  const buildings = [
    { w: 6, h: 14, d: 6, x: -9, z: -7,  color: 0x1a4d4d },
    { w: 5, h: 20, d: 5, x: -1, z:  4,  color: 0x1a5555 },
    { w: 7, h:  9, d: 6, x:  8, z: -4,  color: 0x1a4040 },
    { w: 4, h: 16, d: 4, x: 11, z:  7,  color: 0x155050 },
  ]
  for (const b of buildings) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(b.w, b.h, b.d),
      new THREE.MeshStandardMaterial({ color: b.color, roughness: 0.4, metalness: 0.3 }),
    )
    mesh.position.set(b.x, b.h / 2, b.z)
    mesh.castShadow = mesh.receiveShadow = true
    g.add(mesh)
  }

  g.add(glowRing(0x00ffcc))
  const lbl = zoneLabel('PROJECTS')
  lbl.position.set(0, 24, 0)
  g.add(lbl)
  return g
}

function buildAbout(up, scene) {
  const g = new THREE.Group()

  // Tall monolith
  const monolith = new THREE.Mesh(
    new THREE.BoxGeometry(3, 24, 3),
    new THREE.MeshStandardMaterial({
      color: 0xffffff, emissive: 0xaaccff, emissiveIntensity: 0.6,
      roughness: 0.1, metalness: 0.8,
    }),
  )
  monolith.position.y = 12
  monolith.castShadow = true
  g.add(monolith)

  // Scattered rocks
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x888888, flatShading: true, roughness: 0.9 })
  const rockData = [[-11, 1, -5, 2.0], [9, 1, 8, 1.5], [-7, 1, 11, 2.5], [13, 1, -3, 1.8], [-13, 1, 5, 1.2]]
  for (const [x, y, z, s] of rockData) {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), rockMat)
    rock.position.set(x, y, z)
    rock.rotation.y = Math.random() * Math.PI
    rock.castShadow = true
    g.add(rock)
  }

  g.add(glowRing(0xaaccff))
  const lbl = zoneLabel('ABOUT')
  lbl.position.set(0, 28, 0)
  g.add(lbl)
  return g
}

function buildPhotography(up, scene) {
  const g = new THREE.Group()

  // Camera body
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3, metalness: 0.7 })
  const body = new THREE.Mesh(new THREE.BoxGeometry(10, 7, 6), bodyMat)
  body.position.y = 6
  body.castShadow = true
  g.add(body)

  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(1.8, 2.2, 5, 16),
    new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.05, metalness: 0.95 }),
  )
  lens.rotation.x = Math.PI / 2
  lens.position.set(0, 6, 5)
  g.add(lens)

  // Gallery frames
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xddddcc, roughness: 0.5 })
  for (const [x, z] of [[-13, -4], [-8, 7], [13, -2], [9, 8]]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.4, 15, 0.4), frameMat)
    post.position.set(x, 7.5, z)
    const frame = new THREE.Mesh(new THREE.BoxGeometry(7, 9, 0.3), frameMat)
    frame.position.set(x, 12, z)
    post.castShadow = frame.castShadow = true
    g.add(post, frame)
  }

  g.add(glowRing(0xff88aa))
  const lbl = zoneLabel('PHOTOGRAPHY')
  lbl.position.set(0, 20, 0)
  g.add(lbl)
  return g
}

function buildContact(up, scene) {
  const g = new THREE.Group()

  // Beacon tower
  const tower = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 2.5, 7, 12),
    new THREE.MeshStandardMaterial({
      color: 0xffd700, emissive: 0xff8800, emissiveIntensity: 1.0,
      roughness: 0.3, metalness: 0.6,
    }),
  )
  tower.position.y = 3.5
  tower.castShadow = true
  g.add(tower)

  // Pulsing point light at beacon tip — stored on group for animation
  const beacon = new THREE.PointLight(0xff8800, 4, 80)
  beacon.position.y = 8
  beacon.name = 'beacon'
  g.add(beacon)

  g.add(glowRing(0xffd700))
  const lbl = zoneLabel('CONTACT')
  lbl.position.set(0, 10, 0)
  g.add(lbl)
  return g
}

// ── Tree InstancedMesh (scattered around the world) ──────────────────────────

export function buildWorldTrees(scene) {
  const COUNT   = 120
  const trunkG  = new THREE.CylinderGeometry(0.4, 0.7, 5, 6)
  const canopyG = new THREE.ConeGeometry(3.5, 7, 6)
  const trunkM  = new THREE.MeshStandardMaterial({ color: 0x8B5E3C, roughness: 0.8 })
  const canopyM = new THREE.MeshStandardMaterial({ color: 0x4CAF50, roughness: 0.8 })

  const trunks  = new THREE.InstancedMesh(trunkG, trunkM, COUNT)
  const canopies = new THREE.InstancedMesh(canopyG, canopyM, COUNT)
  trunks.castShadow = canopies.castShadow = true

  const dummy  = new THREE.Object3D()
  const worldY = new THREE.Vector3(0, 1, 0)

  for (let i = 0; i < COUNT; i++) {
    const phi   = Math.acos(2 * Math.random() - 1)
    const theta = Math.random() * Math.PI * 2
    const dir   = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta),
    )
    const base = dir.clone().multiplyScalar(SURFACE_R)

    dummy.position.copy(base.clone().addScaledVector(dir, 2.5))
    dummy.quaternion.setFromUnitVectors(worldY, dir)
    dummy.updateMatrix()
    trunks.setMatrixAt(i, dummy.matrix)

    dummy.position.copy(base.clone().addScaledVector(dir, 8.5))
    dummy.quaternion.setFromUnitVectors(worldY, dir)
    dummy.updateMatrix()
    canopies.setMatrixAt(i, dummy.matrix)
  }

  trunks.instanceMatrix.needsUpdate = true
  canopies.instanceMatrix.needsUpdate = true
  scene.add(trunks, canopies)
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Builds all four portfolio zones and returns their world-space center
 * positions (needed by ZoneInteraction for proximity detection).
 * @param {THREE.Scene} scene
 * @returns {Array<{id, label, desc, color, position: THREE.Vector3, group: THREE.Group}>}
 */
export function buildZones(scene) {
  const result = []

  for (const def of ZONE_DEFS) {
    const pos = toSphere(def.lat, def.lon, SURFACE_R)
    const up  = pos.clone().normalize()

    let g
    if (def.id === 'projects')    g = buildProjects(up, scene)
    if (def.id === 'about')       g = buildAbout(up, scene)
    if (def.id === 'photography') g = buildPhotography(up, scene)
    if (def.id === 'contact')     g = buildContact(up, scene)

    alignToNormal(g, pos, up)
    scene.add(g)

    result.push({ ...def, position: pos.clone(), group: g })
  }

  return result
}
