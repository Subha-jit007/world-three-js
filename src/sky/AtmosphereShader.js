import * as THREE from 'three'
import {
  PLANET_RADIUS,
  ATMO_THICKNESS,
  ATMO_COLOR,
  ATMO_FRESNEL_POWER,
  ATMO_INTENSITY,
} from '../constants.js'

// Outputs surface normal and world-space position for the fragment shader
const VERT = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  void main() {
    vNormal   = normalize(normalMatrix * normal);
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Fresnel rim glow: bright at silhouette edges, invisible at center disc
const FRAG = /* glsl */`
  uniform vec3  uColor;
  uniform float uPower;
  uniform float uIntensity;

  varying vec3 vNormal;
  varying vec3 vWorldPos;

  void main() {
    vec3  viewDir = normalize(cameraPosition - vWorldPos);
    float rim     = 1.0 - max(dot(vNormal, viewDir), 0.0);
    rim = pow(rim, uPower);
    float alpha = rim * uIntensity;
    gl_FragColor = vec4(uColor, alpha);
  }
`

/**
 * Adds a Fresnel rim-glow atmosphere around the planet.
 * Glows at silhouette edges and is invisible from straight above — the
 * "oh damn" upgrade that makes the planet read as a real sphere against space.
 *
 * @param {THREE.Scene} scene
 */
export function buildAtmosphere(scene) {
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(PLANET_RADIUS + ATMO_THICKNESS, 48, 32),
    new THREE.ShaderMaterial({
      vertexShader:   VERT,
      fragmentShader: FRAG,
      uniforms: {
        uColor:     { value: new THREE.Color(ATMO_COLOR) },
        uPower:     { value: ATMO_FRESNEL_POWER },
        uIntensity: { value: ATMO_INTENSITY },
      },
      blending:    THREE.AdditiveBlending,
      side:        THREE.FrontSide,
      depthWrite:  false,
      transparent: true,
    }),
  ))
}
