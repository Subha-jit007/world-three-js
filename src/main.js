import * as THREE from 'three'
import { createRenderer }      from './core/Renderer.js'
import { SpringCamera }        from './core/SpringCamera.js'
import { createComposer }      from './core/PostProcessing.js'
import { setupLights }         from './world/Lights.js'
import { buildPlanet }         from './world/Planet.js'
import { addRocks, addTrees }  from './world/Props.js'
import { Cosmos }              from './sky/Cosmos.js'
import { DayNight }            from './sky/DayNight.js'
import { buildAtmosphere }     from './sky/AtmosphereShader.js'
import { Player }              from './player/Player.js'
import { Controls }            from './player/Controls.js'
import { Physics }             from './player/Physics.js'
import { Dust }                from './fx/Dust.js'
import { HUD }                 from './hud/HUD.js'
import { computeHUDData }      from './utils/geo.js'
import {
  CAM_FOV, CAM_NEAR, CAM_FAR,
  PLANET_RADIUS, CAM_INIT_Y, CAM_INIT_Z,
  DUST_SPAWN_WALK, DUST_SPAWN_JUMP, DUST_SPAWN_LAND,
} from './constants.js'

// ─── Scene ───────────────────────────────────────────────────────────────────
const scene = new THREE.Scene()
// No fog — the cosmos sphere and post-processing vignette handle visual depth

// ─── Renderer & Camera ───────────────────────────────────────────────────────
const renderer = createRenderer()
const camera   = new THREE.PerspectiveCamera(CAM_FOV, window.innerWidth / window.innerHeight, CAM_NEAR, CAM_FAR)

// ─── Post-processing ─────────────────────────────────────────────────────────
// Must be created after renderer. Replaces renderer.render() in the game loop.
const composer = createComposer(renderer, scene, camera)

// ─── World ───────────────────────────────────────────────────────────────────
const { ambient } = setupLights(scene)
buildPlanet(scene)
buildAtmosphere(scene)
addRocks(scene)
addTrees(scene)

// ─── Cosmos (skybox + day/night sun) ─────────────────────────────────────────
const cosmos   = new Cosmos(scene)
const dayNight = new DayNight(scene, cosmos, ambient)

// ─── Systems ─────────────────────────────────────────────────────────────────
const player    = new Player(scene)
const controls  = new Controls()
const physics   = new Physics()
const dust      = new Dust(scene)
const hud       = new HUD()
const springCam = new SpringCamera(camera)

// Wire physics events to dust FX
const spawnDust = (count) =>
  dust.spawn(player.position.clone(), player.position.clone().normalize(), count)

physics.onWalkStep = () => spawnDust(DUST_SPAWN_WALK)
physics.onJump     = () => spawnDust(DUST_SPAWN_JUMP)
physics.onLand     = () => spawnDust(DUST_SPAWN_LAND)

// Place camera before the first frame
springCam.reset(new THREE.Vector3(0, PLANET_RADIUS + CAM_INIT_Y, CAM_INIT_Z))

// ─── Game loop ───────────────────────────────────────────────────────────────
let lastTime = performance.now()

function tick() {
  requestAnimationFrame(tick)
  const now = performance.now()
  const dt  = (now - lastTime) * 0.001   // seconds — needed for cosmos rotation
  lastTime  = now

  const { surfaceUp, walking } = physics.update(player.position, controls)
  player.orient(surfaceUp, physics.forward)
  player.animate(walking, physics.speed, now)
  springCam.update(player.position, physics.forward, surfaceUp)
  dayNight.update(dt)
  cosmos.update(dt)
  dust.update()
  hud.update(computeHUDData(player.position, physics.forward, physics.onGround, physics.speed))

  composer.render()   // replaces renderer.render() — composer runs all passes then outputs
}

tick()

// ─── Resize ──────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  composer.setSize(window.innerWidth, window.innerHeight)
})
