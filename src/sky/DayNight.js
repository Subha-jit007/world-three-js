import * as THREE from 'three'
import { buildSkyDome } from './SkyDome.js'
import { SUN_DISTANCE, SUN_RADIUS } from '../constants.js'

const CYCLE_SECONDS = 120

// Four keyframes: time 0=midnight, 0.25=sunrise, 0.5=noon, 0.75=sunset
const KF = [
  { t: 0.00, top: 0x000511, horizon: 0x0a0a20, stars: 1.0, sunI: 0.0, sunC: 0xfffbe0, ambC: 0x0a1020, ambI: 0.15 },
  { t: 0.25, top: 0x1a3a6e, horizon: 0xff8c5a, stars: 0.3, sunI: 0.6, sunC: 0xff8c5a, ambC: 0x4d2f1a, ambI: 0.25 },
  { t: 0.50, top: 0x5ba8d8, horizon: 0xc8e0f0, stars: 0.0, sunI: 1.0, sunC: 0xfff9f0, ambC: 0x2a4060, ambI: 0.50 },
  { t: 0.75, top: 0x1a3a6e, horizon: 0xff6a3a, stars: 0.3, sunI: 0.6, sunC: 0xff6a3a, ambC: 0x4d2f1a, ambI: 0.25 },
]

// Pre-allocated to avoid per-frame GC
const _ca = new THREE.Color(), _cb = new THREE.Color()
const _r = {
  topColor:    new THREE.Color(),
  horizonColor: new THREE.Color(),
  sunColor:    new THREE.Color(),
  ambColor:    new THREE.Color(),
  starOpacity:  0,
  sunIntensity: 0,
  ambIntensity: 0,
}

function interpolateKF(time) {
  const n = KF.length
  let i = n - 1  // default: last segment, wraps to midnight
  for (let j = 0; j < n - 1; j++) {
    if (time < KF[j + 1].t) { i = j; break }
  }
  const a = KF[i], b = KF[(i + 1) % n]
  const segLen = i < n - 1 ? b.t - a.t : 1.0 - a.t
  const al = segLen > 0 ? (time - a.t) / segLen : 0

  _ca.setHex(a.top);     _cb.setHex(b.top);     _r.topColor.copy(_ca).lerp(_cb, al)
  _ca.setHex(a.horizon); _cb.setHex(b.horizon); _r.horizonColor.copy(_ca).lerp(_cb, al)
  _ca.setHex(a.sunC);    _cb.setHex(b.sunC);    _r.sunColor.copy(_ca).lerp(_cb, al)
  _ca.setHex(a.ambC);    _cb.setHex(b.ambC);    _r.ambColor.copy(_ca).lerp(_cb, al)
  _r.starOpacity  = a.stars + (b.stars - a.stars) * al
  _r.sunIntensity = a.sunI  + (b.sunI  - a.sunI)  * al
  _r.ambIntensity = a.ambI  + (b.ambI  - a.ambI)  * al
}

function ss(e0, e1, x) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

function moonGlowTex() {
  const s = 128, h = s / 2
  const c = document.createElement('canvas')
  c.width = c.height = s
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(h, h, 0, h, h, h)
  g.addColorStop(0,   'rgba(200,220,255,0.5)')
  g.addColorStop(0.4, 'rgba(180,200,245,0.18)')
  g.addColorStop(1,   'rgba(180,200,245,0)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s)
  return new THREE.CanvasTexture(c)
}

/**
 * Minecraft-style day/night cycle.
 * Drives sky gradient, sun orbit + color/intensity, star opacity, and moon.
 *
 * Press T to skip time forward 0.1 for quick testing.
 */
export class DayNight {
  /**
   * @param {THREE.Scene} scene
   * @param {import('./Cosmos.js').Cosmos} cosmos
   * @param {THREE.AmbientLight} ambient
   */
  constructor(scene, cosmos, ambient) {
    this.time = 0.5  // start at noon for best first impression

    this._cosmos  = cosmos
    this._ambient = ambient

    const { mesh, uniforms } = buildSkyDome()
    this._skyU = uniforms
    scene.add(mesh)

    this._buildMoon(scene)

    window.addEventListener('keydown', e => {
      if (e.key === 't' || e.key === 'T') this.time = (this.time + 0.1) % 1
    })
  }

  _buildMoon(scene) {
    this._moonMesh = new THREE.Mesh(
      new THREE.SphereGeometry(SUN_RADIUS * 0.55, 12, 8),
      new THREE.MeshBasicMaterial({ color: 0xeef4ff }),
    )
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map:        moonGlowTex(),
      blending:   THREE.AdditiveBlending,
      depthWrite: false,
    }))
    glow.scale.set(SUN_RADIUS * 8, SUN_RADIUS * 8, 1)
    this._moonMesh.add(glow)

    this._moonLight = new THREE.DirectionalLight(0x8099cc, 0)
    scene.add(this._moonMesh)
    scene.add(this._moonLight)
  }

  /** @param {number} dt  seconds since last frame */
  update(dt) {
    this.time = (this.time + dt / CYCLE_SECONDS) % 1
    const angle = this.time * Math.PI * 2

    // Sun orbit in XY plane: overhead at noon (t=0.5), below at midnight (t=0)
    const sunX = Math.sin(angle) * SUN_DISTANCE
    const sunY = -Math.cos(angle) * SUN_DISTANCE
    this._cosmos.setSunPosition(sunX, sunY, 0)

    // Moon on the opposite side
    const moonNormY = -sunY / SUN_DISTANCE  // +1 at midnight, -1 at noon
    this._moonMesh.position.set(-sunX, -sunY, 0)
    this._moonLight.position.set(-sunX, -sunY, 0)
    this._moonMesh.visible    = moonNormY > -0.15
    this._moonLight.intensity = ss(-0.15, 0.25, moonNormY) * 0.15

    interpolateKF(this.time)
    this._skyU.uTopColor.value.copy(_r.topColor)
    this._skyU.uHorizonColor.value.copy(_r.horizonColor)
    this._cosmos.setStarOpacity(_r.starOpacity)
    this._cosmos.setSunState(_r.sunColor, _r.sunIntensity)
    this._ambient.color.copy(_r.ambColor)
    this._ambient.intensity = _r.ambIntensity
  }
}
