import * as THREE from 'three'
import {
  COSMOS_RADIUS,
  GALAXY_STAR_COUNT,
  GALAXY_ARMS,
  GALAXY_DISK_SPREAD,
  GALAXY_HALO_FRACTION,
  GALAXY_SPIRAL_TWIST,
  GALAXY_TILT,
  GALAXY_BRIGHT_FRACTION,
  GALAXY_BRIGHT_BOOST,
} from '../constants.js'

// Box-Muller gaussian sample with std deviation
function gaussian(std = 1) {
  let u, v
  do { u = Math.random() } while (u === 0)
  do { v = Math.random() } while (v === 0)
  return std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

// Map spectral temperature t ∈ [0,1] to an RGB star color
function tempToColor(t, out) {
  if      (t > 0.85) out.setRGB(0.70, 0.80, 1.00)  // O/B  blue-white
  else if (t > 0.65) out.setRGB(0.95, 0.97, 1.00)  // A    white
  else if (t > 0.45) out.setRGB(1.00, 0.96, 0.75)  // G    yellow-white
  else if (t > 0.25) out.setRGB(1.00, 0.70, 0.40)  // K    orange
  else               out.setRGB(1.00, 0.35, 0.20)  // M    red
}

// Vertex: per-star size attribute + color attribute, soft point sprite
const VERT = /* glsl */`
  attribute float aSize;
  attribute vec3  aColor;
  varying   vec3  vColor;

  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (300.0 / -mv.z);
    gl_Position  = projectionMatrix * mv;
  }
`

// Fragment: radial soft disc with circular discard for clean points
const FRAG = /* glsl */`
  uniform float uOpacity;
  varying vec3 vColor;

  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.08, 0.5, d);
    gl_FragColor = vec4(vColor * uOpacity, alpha * uOpacity);
  }
`

/**
 * Builds a 60k-star galaxy particle system projected onto a sphere of
 * COSMOS_RADIUS. Stars follow a spiral arm distribution (75%) and a
 * diffuse halo (25%), with per-star spectral color and size variation.
 * Bright giant stars carry boosted RGB values > 1 so the bloom pass
 * picks them up and makes them glow.
 *
 * The returned Points object is pre-tilted by GALAXY_TILT so the
 * galactic band crosses the sky diagonally, matching the real Milky Way.
 *
 * @returns {THREE.Points}
 */
export function buildGalaxyParticles() {
  const n         = GALAXY_STAR_COUNT
  const positions = new Float32Array(n * 3)
  const colors    = new Float32Array(n * 3)
  const sizes     = new Float32Array(n)
  const tmp       = new THREE.Color()

  for (let i = 0; i < n; i++) {
    let theta, elevPhi

    if (Math.random() > GALAXY_HALO_FRACTION) {
      // ── Spiral arm star ──────────────────────────────────────────────────
      const arm    = Math.floor(Math.random() * GALAXY_ARMS)
      const t      = Math.pow(Math.random(), 0.4)          // bias toward core
      const spread = gaussian(0.3)                          // arm scatter
      theta   = (arm / GALAXY_ARMS) * Math.PI * 2 + t * GALAXY_SPIRAL_TWIST + spread
      elevPhi = gaussian(GALAXY_DISK_SPREAD)                // stay near disk plane
    } else {
      // ── Halo / background star ────────────────────────────────────────
      theta   = Math.random() * Math.PI * 2
      elevPhi = gaussian(0.5)                               // wider scatter
    }

    const cosE = Math.cos(elevPhi)
    positions[i * 3]     = COSMOS_RADIUS * cosE * Math.cos(theta)
    positions[i * 3 + 1] = COSMOS_RADIUS * Math.sin(elevPhi)
    positions[i * 3 + 2] = COSMOS_RADIUS * cosE * Math.sin(theta)

    tempToColor(Math.random(), tmp)
    const isBright = Math.random() < GALAXY_BRIGHT_FRACTION
    const boost    = isBright ? GALAXY_BRIGHT_BOOST + Math.random() * 2 : 1
    colors[i * 3]     = tmp.r * boost
    colors[i * 3 + 1] = tmp.g * boost
    colors[i * 3 + 2] = tmp.b * boost

    sizes[i] = isBright ? 3.5 + Math.random() * 2 : 1.0 + Math.random() * 1.5
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('aColor',   new THREE.BufferAttribute(colors,    3))
  geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes,     1))

  const mat = new THREE.ShaderMaterial({
    uniforms:       { uOpacity: { value: 1.0 } },
    vertexShader:   VERT,
    fragmentShader: FRAG,
    blending:       THREE.AdditiveBlending,
    depthWrite:     false,
    transparent:    true,
  })

  const points = new THREE.Points(geo, mat)
  points.rotation.z = GALAXY_TILT   // tilt so the band crosses the sky diagonally
  return { points, material: mat }
}
