import * as THREE from 'three'
import { EffectComposer }  from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass }      from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { ShaderPass }      from 'three/addons/postprocessing/ShaderPass.js'
import {
  BLOOM_STRENGTH, BLOOM_RADIUS, BLOOM_THRESHOLD,
  VIGNETTE_INTENSITY,
} from '../constants.js'

// Full-screen vignette — subtle edge darkening, no external texture needed
const VignetteShader = {
  uniforms: {
    tDiffuse:  { value: null },
    intensity: { value: VIGNETTE_INTENSITY },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float     intensity;
    varying vec2      vUv;

    void main() {
      vec4  color = texture2D(tDiffuse, vUv);
      vec2  uv    = vUv - 0.5;
      float vig   = 1.0 - dot(uv, uv) * intensity;
      gl_FragColor = vec4(color.rgb * vig, color.a);
    }
  `,
}

/**
 * Creates an EffectComposer with:
 *   1. RenderPass      — standard scene render
 *   2. UnrealBloomPass — makes bright stars, sun, and visor actually glow
 *   3. ShaderPass      — vignette darkens screen edges
 *
 * Uses a HalfFloat render target so HDR values (> 1.0) from the galaxy
 * shader survive into the bloom pass instead of being clamped.
 *
 * Call composer.render() instead of renderer.render() in your game loop.
 * Call composer.setSize(w, h) on window resize.
 *
 * @param {THREE.WebGLRenderer}      renderer
 * @param {THREE.Scene}              scene
 * @param {THREE.PerspectiveCamera}  camera
 * @returns {EffectComposer}
 */
export function createComposer(renderer, scene, camera) {
  const target = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    { type: THREE.HalfFloatType },   // HDR buffer — values > 1 reach the bloom pass
  )

  const composer = new EffectComposer(renderer, target)
  composer.addPass(new RenderPass(scene, camera))

  composer.addPass(new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    BLOOM_STRENGTH,
    BLOOM_RADIUS,
    BLOOM_THRESHOLD,
  ))

  composer.addPass(new ShaderPass(VignetteShader))

  return composer
}
