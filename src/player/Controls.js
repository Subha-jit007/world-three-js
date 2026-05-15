/**
 * Manages keyboard and touch input.
 * Read-only properties reflect the current input state each frame.
 */
export class Controls {
  constructor() {
    this._keys = new Set()
    this._bindKeyboard()
    this._bindMobile()
  }

  get forward()  { return this._keys.has('KeyW') }
  get backward() { return this._keys.has('KeyS') }
  get left()     { return this._keys.has('KeyA') }
  get right()    { return this._keys.has('KeyD') }
  get jump()     { return this._keys.has('Space') }
  get sprint()   { return this._keys.has('ShiftLeft') || this._keys.has('ShiftRight') }
  get interact() { return this._keys.has('KeyE') }

  _press(code)   { this._keys.add(code) }
  _release(code) { this._keys.delete(code) }

  _bindKeyboard() {
    window.addEventListener('keydown', e => {
      if (e.code === 'Space') e.preventDefault()
      this._press(e.code)
    })
    window.addEventListener('keyup', e => this._release(e.code))
  }

  _bindMobile() {
    const mapping = {
      'btn-fwd':   'KeyW',
      'btn-back':  'KeyS',
      'btn-left':  'KeyA',
      'btn-right': 'KeyD',
      'btn-jump':  'Space',
    }
    for (const [id, code] of Object.entries(mapping)) {
      const el = document.getElementById(id)
      if (!el) continue
      const press   = () => { this._press(code);   el.classList.add('active') }
      const release = () => { this._release(code); el.classList.remove('active') }
      el.addEventListener('pointerdown',   press)
      el.addEventListener('pointerup',     release)
      el.addEventListener('pointercancel', release)
    }
  }
}
