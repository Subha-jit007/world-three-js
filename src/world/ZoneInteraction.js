import { ZONE_PROXIMITY, ZONE_ENTER } from '../constants.js'

/**
 * Proximity-based zone interaction.
 * Shows a "Press E" hint when near a zone, opens/closes an info panel on E.
 */
export class ZoneInteraction {
  /**
   * @param {Array<{id, label, desc, color, position}>} zones
   */
  constructor(zones) {
    this._zones       = zones
    this._activeZone  = null
    this._panelOpen   = false
    this._eWasDown    = false

    this._panel = document.getElementById('zone-panel')
    this._title = document.getElementById('zone-panel-title')
    this._desc  = document.getElementById('zone-panel-desc')
    this._close = document.getElementById('zone-panel-close')
    this._hint  = document.getElementById('zone-hint')

    this._close?.addEventListener('click', () => this._closePanel())

    window.addEventListener('keydown', e => {
      if ((e.key === 'e' || e.key === 'E') && !this._eWasDown) {
        this._eWasDown = true
        if (this._panelOpen) {
          this._closePanel()
        } else if (this._activeZone) {
          this._openPanel(this._activeZone)
        }
      }
    })
    window.addEventListener('keyup', e => {
      if (e.key === 'e' || e.key === 'E') this._eWasDown = false
    })
  }

  /** Call every frame with the player's world position. */
  update(playerPos) {
    let nearest = null
    let nearestDist = Infinity

    for (const zone of this._zones) {
      const dist = playerPos.distanceTo(zone.position)
      if (dist < nearestDist) {
        nearestDist = dist
        nearest = zone
      }
    }

    const inRange = nearest && nearestDist < ZONE_PROXIMITY

    // Update hint visibility
    if (inRange && !this._panelOpen) {
      this._hint?.classList.remove('hidden')
      this._hint.textContent = `Press E — ${nearest.label}`
    } else {
      this._hint?.classList.add('hidden')
    }

    // Auto-close panel if player walks too far away
    if (this._panelOpen && nearest) {
      const openZoneDist = playerPos.distanceTo(this._activeZone.position)
      if (openZoneDist > ZONE_PROXIMITY * 2.5) this._closePanel()
    }

    this._activeZone = inRange ? nearest : null
  }

  _openPanel(zone) {
    this._panelOpen = true
    this._activeZone = zone
    this._title.textContent = zone.label
    this._desc.textContent  = zone.desc
    this._panel?.classList.remove('hidden')
    this._hint?.classList.add('hidden')

    // Tint the panel accent to the zone color
    const hex = '#' + zone.color.toString(16).padStart(6, '0')
    this._panel?.style.setProperty('--zone-color', hex)
  }

  _closePanel() {
    this._panelOpen = false
    this._panel?.classList.add('hidden')
  }
}
