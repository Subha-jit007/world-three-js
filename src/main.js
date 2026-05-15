import * as THREE from 'three'
import { CSS2DRenderer }       from 'three/addons/renderers/CSS2DRenderer.js'
import { createRenderer }      from './core/Renderer.js'
import { SpringCamera }        from './core/SpringCamera.js'
import { createComposer }      from './core/PostProcessing.js'
import { setupLights }         from './world/Lights.js'
import { buildPlanet }         from './world/Planet.js'
import { addRocks }            from './world/Props.js'
import { buildZones, buildWorldTrees } from './world/Zones.js'
import { ZoneInteraction }     from './world/ZoneInteraction.js'
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

// ─── Renderer & Camera ───────────────────────────────────────────────────────
const renderer = createRenderer()
const camera   = new THREE.PerspectiveCamera(CAM_FOV, window.innerWidth / window.innerHeight, CAM_NEAR, CAM_FAR)

// ─── CSS2D renderer (floating zone labels) ───────────────────────────────────
const labelRenderer = new CSS2DRenderer()
labelRenderer.setSize(window.innerWidth, window.innerHeight)
labelRenderer.domElement.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;'
document.body.appendChild(labelRenderer.domElement)

// ─── Post-processing ─────────────────────────────────────────────────────────
const composer = createComposer(renderer, scene, camera)

// ─── World ───────────────────────────────────────────────────────────────────
const { ambient } = setupLights(scene)
buildPlanet(scene)
buildAtmosphere(scene)
addRocks(scene)
buildWorldTrees(scene)

// ─── Cosmos + Day/night ───────────────────────────────────────────────────────
const cosmos   = new Cosmos(scene)
const dayNight = new DayNight(scene, cosmos, ambient)

// ─── Portfolio zones ─────────────────────────────────────────────────────────
const zones          = buildZones(scene)
const zoneInteraction = new ZoneInteraction(zones)

// ─── Player systems ───────────────────────────────────────────────────────────
const player    = new Player(scene)
const controls  = new Controls()
const physics   = new Physics()
const dust      = new Dust(scene)
const hud       = new HUD()
const springCam = new SpringCamera(camera)

const spawnDust = (count) =>
  dust.spawn(player.position.clone(), player.position.clone().normalize(), count)

physics.onWalkStep = () => spawnDust(DUST_SPAWN_WALK)
physics.onJump     = () => spawnDust(DUST_SPAWN_JUMP)
physics.onLand     = () => spawnDust(DUST_SPAWN_LAND)

springCam.reset(new THREE.Vector3(0, PLANET_RADIUS + CAM_INIT_Y, CAM_INIT_Z))

// ─── Game loop ───────────────────────────────────────────────────────────────
let lastTime = performance.now()

function tick() {
  requestAnimationFrame(tick)
  const now = performance.now()
  const dt  = Math.min((now - lastTime) * 0.001, 0.1)  // cap at 100ms
  lastTime  = now

  const { surfaceUp, walking } = physics.update(player.position, controls)
  player.orient(surfaceUp, physics.forward)
  player.animate(walking, physics.speed, now)
  springCam.update(player.position, physics.forward, surfaceUp)

  // Pulse the Contact beacon light
  const contactZone = zones.find(z => z.id === 'contact')
  if (contactZone) {
    const beacon = contactZone.group.getObjectByName('beacon')
    if (beacon) beacon.intensity = 3 + Math.sin(now * 0.003) * 1.5
  }

  dayNight.update(dt)
  cosmos.update(dt)
  zoneInteraction.update(player.position)
  dust.update()
  hud.update(computeHUDData(player.position, physics.forward, physics.onGround, physics.speed))

  composer.render()
  labelRenderer.render(scene, camera)
}

tick()

// ─── Resize ──────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  composer.setSize(window.innerWidth, window.innerHeight)
  labelRenderer.setSize(window.innerWidth, window.innerHeight)
})
