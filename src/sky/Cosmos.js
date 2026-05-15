import * as THREE from 'three'
import { buildGalaxyParticles } from './GalaxyParticles.js'
import {
  GALAXY_ROTATION_PERIOD,
  SUN_DISTANCE, SUN_RADIUS,
  SUN_INTENSITY,
} from '../constants.js'

const ROT_SPEED = (Math.PI * 2) / GALAXY_ROTATION_PERIOD  // radians per second

/**
 * Generate a soft radial-gradient canvas texture for nebulae and the sun glow.
 * Returns a THREE.CanvasTexture — no external assets required.
 */
function softSprite(r, g, b, innerOpacity = 0.5) {
  const size = 128, half = size / 2
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half)
  const ri = ~~(r * 255), gi = ~~(g * 255), bi = ~~(b * 255)
  grad.addColorStop(0,    `rgba(${ri},${gi},${bi},${innerOpacity})`)
  grad.addColorStop(0.35, `rgba(${ri},${gi},${bi},${(innerOpacity * 0.4).toFixed(2)})`)
  grad.addColorStop(1,    `rgba(${ri},${gi},${bi},0)`)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

// Distant scenic planets — pure ambience, no physics
const DISTANT_PLANETS = [
  { color: 0xD4A563, radius: 2.8, pos: new THREE.Vector3( 120,  40, -190) }, // Jupiter-ish
  { color: 0xC1440E, radius: 1.0, pos: new THREE.Vector3(-140, -25,  185) }, // Mars-ish
  { color: 0x4B8FDD, radius: 1.6, pos: new THREE.Vector3( 195,  55,  110) }, // Neptune-ish
]

// Nebulae — sprite billboards with additive soft-glow textures
const NEBULAE = [
  { r: 0.53, g: 0.27, b: 0.80, pos: new THREE.Vector3(-250,  80, -150), scale: 80 }, // purple
  { r: 0.13, g: 0.33, b: 0.67, pos: new THREE.Vector3( 200, -50, -200), scale: 65 }, // blue
  { r: 0.73, g: 0.13, b: 0.27, pos: new THREE.Vector3( -80, 100,  290), scale: 72 }, // red
]

/**
 * Owns the entire cosmos layer: galaxy particles, sun, distant planets, nebulae.
 * Everything hangs off a single pivot Object3D so one rotation drives day/night.
 *
 * From main.js:
 *   const cosmos = new Cosmos(scene)
 *   cosmos.update(dt)   ← call each frame
 */
export class Cosmos {
  /**
   * @param {THREE.Scene} scene
   *   The sun's DirectionalLight is added directly to scene (not the pivot)
   *   so shadows work correctly, then synced to the pivot each frame.
   */
  constructor(scene) {
    this._pivot = new THREE.Object3D()
    scene.add(this._pivot)

    this._buildGalaxy()
    this._buildSun(scene)
    // Distant planets and nebulae removed — visible from space, wrong from ground
  }

  /** @param {number} dt  seconds since last frame */
  update(dt) {
    this._pivot.rotation.y += ROT_SPEED * dt
    // Sun position and state are driven externally by DayNight each frame.
  }

  /** Called by DayNight each frame to orbit the visual sun and its light. */
  setSunPosition(x, y, z) {
    this._sunMesh.position.set(x, y, z)
    this._sunLight.position.set(x, y, z)
  }

  /** Called by DayNight to tint the sun mesh, glow sprite, and directional light. */
  setSunState(color, intensity) {
    this._sunLight.color.copy(color)
    this._sunLight.intensity = intensity
    this._sunMesh.material.color.copy(color)
    this._sunGlowMat.color.copy(color)
  }

  /** Called by DayNight to fade stars in/out across the day/night cycle. */
  setStarOpacity(v) {
    this._galaxyMat.uniforms.uOpacity.value = v
  }

  // ── Private builders ────────────────────────────────────────────────────────

  _buildGalaxy() {
    const { points, material } = buildGalaxyParticles()
    this._galaxyMat = material
    this._pivot.add(points)
  }

  _buildSun(scene) {
    // Initial position: noon (overhead) — DayNight will drive this each frame.
    const initPos = new THREE.Vector3(0, SUN_DISTANCE, 0)

    // Visual sun sphere — MeshBasicMaterial so it ignores scene lighting
    // and always appears at full brightness, which the bloom pass then halos.
    this._sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(SUN_RADIUS, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xfffbe0 }),
    )
    this._sunMesh.position.copy(initPos)
    scene.add(this._sunMesh)   // NOTE: scene-level, not pivot — DayNight sets position directly

    // Large soft glow halo as a sprite child of the sun mesh
    const gc = new THREE.Color(1.0, 0.96, 0.72)
    const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map:        softSprite(gc.r, gc.g, gc.b, 0.6),
      blending:   THREE.AdditiveBlending,
      depthWrite: false,
    }))
    glowSprite.scale.set(SUN_RADIUS * 10, SUN_RADIUS * 10, 1)
    this._sunMesh.add(glowSprite)
    this._sunGlowMat = glowSprite.material  // stored so setSunState can tint it

    // Directional light — position driven by DayNight each frame
    this._sunLight = new THREE.DirectionalLight(0xfff4e0, SUN_INTENSITY)
    this._sunLight.castShadow = true
    this._sunLight.shadow.mapSize.set(2048, 2048)
    Object.assign(this._sunLight.shadow.camera, {
      near: 10, far: 3500, left: -300, right: 300, top: 300, bottom: -300,
    })
    this._sunLight.shadow.bias = -0.001
    this._sunLight.position.copy(initPos)
    scene.add(this._sunLight)
  }

  _buildPlanets() {
    for (const p of DISTANT_PLANETS) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(p.radius, 16, 12),
        new THREE.MeshBasicMaterial({ color: p.color }),
      )
      mesh.position.copy(p.pos)
      this._pivot.add(mesh)
    }
  }

  _buildNebulae() {
    for (const { r, g, b, pos, scale } of NEBULAE) {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map:         softSprite(r, g, b, 0.4),
        blending:    THREE.AdditiveBlending,
        depthWrite:  false,
        transparent: true,
      }))
      sprite.position.copy(pos)
      sprite.scale.set(scale, scale, 1)
      this._pivot.add(sprite)
    }
  }
}
