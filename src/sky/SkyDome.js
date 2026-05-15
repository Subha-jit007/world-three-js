import * as THREE from 'three'
import { COSMOS_RADIUS } from '../constants.js'

const VERT = /* glsl */`
  varying float vY;
  void main() {
    vY = normalize(position).y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAG = /* glsl */`
  uniform vec3 uTopColor;
  uniform vec3 uHorizonColor;
  varying float vY;
  void main() {
    float t = smoothstep(-0.05, 0.4, vY);
    gl_FragColor = vec4(mix(uHorizonColor, uTopColor, t), 1.0);
  }
`

/**
 * Gradient sky sphere rendered from inside.
 * renderOrder = -10 ensures it paints behind all scene geometry.
 * @returns {{ mesh: THREE.Mesh, uniforms: object }}
 */
export function buildSkyDome() {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTopColor:     { value: new THREE.Color(0x000511) },
      uHorizonColor: { value: new THREE.Color(0x0a0a20) },
    },
    vertexShader:   VERT,
    fragmentShader: FRAG,
    side:           THREE.BackSide,
    depthWrite:     false,
    depthTest:      false,
  })

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(COSMOS_RADIUS - 5, 32, 16),
    mat,
  )
  mesh.renderOrder = -10
  return { mesh, uniforms: mat.uniforms }
}
