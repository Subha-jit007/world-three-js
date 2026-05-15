import { HUD_THROTTLE_TICKS, SPEED_DISPLAY_SCALE } from '../constants.js'

/**
 * Updates all HUD DOM elements.
 * Receives plain data — no Three.js dependency.
 */
export class HUD {
  constructor() {
    this._alt    = document.getElementById('stat-alt')
    this._spd    = document.getElementById('stat-spd')
    this._lat    = document.getElementById('stat-lat')
    this._lon    = document.getElementById('stat-lon')
    this._jump   = document.getElementById('jump-ready')
    this._needle = document.getElementById('compass-needle')
    this._tick   = 0
  }

  /**
   * @param {{
   *   altitude:  number,   meters above planet surface
   *   speed:     number,   units per tick
   *   lat:       number,   degrees
   *   lon:       number,   degrees
   *   onGround:  boolean,
   *   bearing:   number,   compass degrees (0 = planet north)
   * }} data
   */
  update({ altitude, speed, lat, lon, onGround, bearing }) {
    if (++this._tick % HUD_THROTTLE_TICKS !== 0) return

    this._alt.textContent = altitude.toFixed(2) + ' m'
    this._spd.textContent = (speed * SPEED_DISPLAY_SCALE).toFixed(1) + ' u/s'
    this._lat.textContent = lat.toFixed(1) + '°'
    this._lon.textContent = lon.toFixed(1) + '°'
    this._jump.style.opacity     = onGround ? '1' : '0'
    this._needle.style.transform = `rotate(${bearing}deg)`
  }
}
