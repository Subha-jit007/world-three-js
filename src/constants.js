// ─── Camera ──────────────────────────────────────────────────────────────────
export const CAM_FOV         = 60
export const CAM_NEAR        = 0.1
export const CAM_FAR         = 3000
export const CAM_DIST        = 8
export const CAM_HEIGHT      = 3
export const CAM_SPRING_K    = 0.08
export const CAM_SPRING_D    = 0.82
export const CAM_UP_LERP     = 0.06
export const CAM_INIT_Y      = 8
export const CAM_INIT_Z      = 6

// ─── World ───────────────────────────────────────────────────────────────────
export const PLANET_RADIUS   = 500

// ─── Terrain ─────────────────────────────────────────────────────────────────
export const TERRAIN_SUBDIV        = 5
export const TERRAIN_DISP_BASE     = 6
export const TERRAIN_DISP_AMP      = 5
export const TERRAIN_FBM_OCTAVES   = 5
export const TERRAIN_COLOR_OFFSET  = -1
export const TERRAIN_COLOR_RANGE   = 10

// ─── Fresnel atmosphere (shader) ─────────────────────────────────────────────
export const ATMO_THICKNESS      = 25
export const ATMO_COLOR          = 0x4488ff
export const ATMO_FRESNEL_POWER  = 3.5
export const ATMO_INTENSITY      = 0.7

// ─── Cosmos ──────────────────────────────────────────────────────────────────
export const COSMOS_RADIUS           = 2500
export const GALAXY_STAR_COUNT       = 60000
export const GALAXY_ARMS             = 4
export const GALAXY_DISK_SPREAD      = 0.12
export const GALAXY_HALO_FRACTION    = 0.25
export const GALAXY_SPIRAL_TWIST     = 2.5
export const GALAXY_TILT             = 0.4
export const GALAXY_ROTATION_PERIOD  = 600
export const GALAXY_BRIGHT_FRACTION  = 0.03
export const GALAXY_BRIGHT_BOOST     = 2.5

// ─── Sun ─────────────────────────────────────────────────────────────────────
export const SUN_DISTANCE  = 2000
export const SUN_RADIUS    = 20

// ─── Lights ──────────────────────────────────────────────────────────────────
export const SUN_INTENSITY   = 2.0
export const RIM_INTENSITY   = 0.5
export const AMB_INTENSITY   = 0.4

// ─── Bloom + vignette ────────────────────────────────────────────────────────
export const BLOOM_STRENGTH      = 0.4
export const BLOOM_RADIUS        = 0.4
export const BLOOM_THRESHOLD     = 0.75
export const VIGNETTE_INTENSITY  = 1.2

// ─── Props ───────────────────────────────────────────────────────────────────
export const ROCK_COUNT          = 40
export const ROCK_SIZE_MIN       = 1.0
export const ROCK_SIZE_VAR       = 3.0
export const TREE_COUNT          = 0     // trees handled by Zones.js InstancedMesh
export const TREE_SURFACE_OFFSET = 2.0

// ─── Player ──────────────────────────────────────────────────────────────────
export const PLAYER_RADIUS   = 0.55
export const GROUND_OFFSET   = 1.5

// ─── Player body proportions ─────────────────────────────────────────────────
export const BODY_TOP_Y    =  0.35
export const BODY_HEIGHT   =  0.7
export const VISOR_Y       =  0.5
export const LEG_X         =  0.24
export const LEG_REST_Y    = -0.6
export const FOOT_REST_Y   = -0.88
export const FOOT_Z        =  0.05

// ─── Animation ───────────────────────────────────────────────────────────────
export const ANIM_STEP_FREQ  = 1.5
export const ANIM_STEP_AMP   = 0.15
export const VISOR_GLOW_BASE = 0.5
export const VISOR_GLOW_AMP  = 0.15
export const VISOR_GLOW_FREQ = 0.003

// ─── Physics ─────────────────────────────────────────────────────────────────
export const GRAVITY         = 0.03
export const WALK_SPEED      = 0.4
export const SPRINT_MULT     = 2.2
export const TURN_SPEED      = 0.032
export const JUMP_VEL        = 0.55

// ─── Dust FX ─────────────────────────────────────────────────────────────────
export const DUST_COUNT      = 80
export const DUST_WALK_PROB  = 0.18
export const DUST_SPAWN_WALK = 2
export const DUST_SPAWN_JUMP = 10
export const DUST_SPAWN_LAND = 8
export const DUST_LIFE_DECAY = 0.016
export const DUST_DRAG       = 0.93
export const DUST_SPREAD_MIN = 0.04
export const DUST_SPREAD_VAR = 0.04
export const DUST_LIFT_MIN   = 0.04
export const DUST_LIFT_VAR   = 0.04
export const DUST_LIFE_MIN   = 0.6
export const DUST_LIFE_VAR   = 0.5

// ─── HUD ─────────────────────────────────────────────────────────────────────
export const HUD_THROTTLE_TICKS  = 3
export const SPEED_DISPLAY_SCALE = 60

// ─── Zone interaction ─────────────────────────────────────────────────────────
export const ZONE_PROXIMITY = 25   // units — show hint when closer than this
export const ZONE_ENTER     = 15   // units — show panel on E press when closer than this
