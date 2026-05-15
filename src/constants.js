// ─── Camera ──────────────────────────────────────────────────────────────────
export const CAM_FOV         = 65
export const CAM_NEAR        = 0.05
export const CAM_FAR         = 600
export const CAM_DIST        = 5.5
export const CAM_HEIGHT      = 2.0
export const CAM_SPRING_K    = 0.08   // stiffness
export const CAM_SPRING_D    = 0.82   // damping
export const CAM_UP_LERP     = 0.06   // how fast the camera up-vector tracks planet surface
export const CAM_INIT_Y      = 5      // initial camera offset above planet surface
export const CAM_INIT_Z      = 8      // initial camera offset behind player

// ─── World ───────────────────────────────────────────────────────────────────
export const PLANET_RADIUS   = 20

// ─── Terrain ─────────────────────────────────────────────────────────────────
export const TERRAIN_SUBDIV        = 5     // IcosahedronGeometry detail level
export const TERRAIN_DISP_BASE     = 0.6   // minimum displacement height
export const TERRAIN_DISP_AMP      = 0.55  // displacement amplitude
export const TERRAIN_FBM_OCTAVES   = 5
export const TERRAIN_COLOR_OFFSET  = 0.05  // altitude at which color gradient starts
export const TERRAIN_COLOR_RANGE   = 1.1   // altitude span for the full color ramp

// ─── Fresnel atmosphere (shader) ─────────────────────────────────────────────
export const ATMO_THICKNESS      = 1.8    // extra radius above planet surface
export const ATMO_COLOR          = 0x4488ff
export const ATMO_FRESNEL_POWER  = 3.5   // tightness of rim glow (higher = thinner ring)
export const ATMO_INTENSITY      = 0.7   // overall glow brightness — keep blue channel below bloom threshold

// ─── Cosmos ──────────────────────────────────────────────────────────────────
export const COSMOS_RADIUS           = 400   // skybox sphere radius
export const GALAXY_STAR_COUNT       = 60000
export const GALAXY_ARMS             = 4
export const GALAXY_DISK_SPREAD      = 0.12  // galaxy disk half-thickness in radians
export const GALAXY_HALO_FRACTION    = 0.25  // fraction of stars placed randomly (halo/background)
export const GALAXY_SPIRAL_TWIST     = 2.5   // arm twist over full length (radians)
export const GALAXY_TILT             = 0.4   // galactic plane tilt in radians
export const GALAXY_ROTATION_PERIOD  = 600   // seconds per full rotation (~10 min)
export const GALAXY_BRIGHT_FRACTION  = 0.03  // fraction of stars that are bright giants
export const GALAXY_BRIGHT_BOOST     = 2.5   // minimum brightness multiplier for bright stars

// ─── Sun ─────────────────────────────────────────────────────────────────────
export const SUN_DISTANCE  = 370   // from cosmos pivot center
export const SUN_RADIUS    = 5
export const SUN_PHI       = 0.25  // elevation angle above galactic plane (radians)

// ─── Lights ──────────────────────────────────────────────────────────────────
export const SUN_INTENSITY   = 2.0
export const RIM_INTENSITY   = 0.6
export const AMB_INTENSITY   = 0.8

// ─── Bloom + vignette ────────────────────────────────────────────────────────
export const BLOOM_STRENGTH      = 0.5   // keep subtle — only true hot sources glow
export const BLOOM_RADIUS        = 0.4
export const BLOOM_THRESHOLD     = 0.9   // only affects things brighter than ~1.0 pre-tone-map
export const VIGNETTE_INTENSITY  = 1.4

// ─── Props ───────────────────────────────────────────────────────────────────
export const ROCK_COUNT          = 55
export const ROCK_SIZE_MIN       = 0.18
export const ROCK_SIZE_VAR       = 0.6    // random size added on top of ROCK_SIZE_MIN
export const TREE_COUNT          = 28
export const TREE_SURFACE_OFFSET = 0.28  // trunk base above terrain surface

// ─── Player ──────────────────────────────────────────────────────────────────
export const PLAYER_RADIUS   = 0.55
export const GROUND_OFFSET   = 0.9       // legs extend below group origin

// ─── Player body proportions (geometry setup + animation rest poses) ─────────
export const BODY_TOP_Y    =  0.35
export const BODY_HEIGHT   =  0.7
export const VISOR_Y       =  0.5
export const LEG_X         =  0.24
export const LEG_REST_Y    = -0.6
export const FOOT_REST_Y   = -0.88
export const FOOT_Z        =  0.05

// ─── Animation ───────────────────────────────────────────────────────────────
export const ANIM_STEP_FREQ  = 6.5    // leg animation cycles per unit of speed
export const ANIM_STEP_AMP   = 0.15   // leg swing amplitude
export const VISOR_GLOW_BASE = 0.5    // emissive base intensity
export const VISOR_GLOW_AMP  = 0.15   // emissive pulse amplitude
export const VISOR_GLOW_FREQ = 0.003  // pulse rate (radians per millisecond)

// ─── Physics ─────────────────────────────────────────────────────────────────
export const GRAVITY         = 0.026
export const WALK_SPEED      = 0.09
export const SPRINT_MULT     = 1.9
export const TURN_SPEED      = 0.032
export const JUMP_VEL        = 0.40

// ─── Dust FX ─────────────────────────────────────────────────────────────────
export const DUST_COUNT      = 80
export const DUST_WALK_PROB  = 0.18   // probability of a dust puff per walking frame
export const DUST_SPAWN_WALK = 2      // particles emitted per walk puff
export const DUST_SPAWN_JUMP = 10     // particles emitted on jump
export const DUST_SPAWN_LAND = 8      // particles emitted on landing
export const DUST_LIFE_DECAY = 0.016  // life lost per frame (~1/60 s)
export const DUST_DRAG       = 0.93   // velocity multiplier per frame
export const DUST_SPREAD_MIN = 0.04   // minimum tangential spread speed
export const DUST_SPREAD_VAR = 0.04   // random spread speed added on top
export const DUST_LIFT_MIN   = 0.04   // minimum upward speed
export const DUST_LIFT_VAR   = 0.04   // random upward speed added on top
export const DUST_LIFE_MIN   = 0.6    // minimum particle lifetime (seconds)
export const DUST_LIFE_VAR   = 0.5    // random lifetime added on top

// ─── HUD ─────────────────────────────────────────────────────────────────────
export const HUD_THROTTLE_TICKS  = 3   // update DOM every N frames
export const SPEED_DISPLAY_SCALE = 60  // units/tick → units/second (assumes 60fps)
