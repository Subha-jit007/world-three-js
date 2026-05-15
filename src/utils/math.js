/** Fast deterministic integer hash → [0, 1] */
function ihash(ix, iy, iz) {
  let h = (Math.imul(ix * 1619 + iy * 31337 + iz * 52591, 1664525) + 1013904223) | 0
  h ^= h >>> 15
  h  = Math.imul(h, 0x85ebca6b) | 0
  h ^= h >>> 13
  return (h >>> 0) / 0xffffffff
}

const _fade = t => t * t * (3 - 2 * t)
const _mix  = (a, b, t) => a + (b - a) * t

/** Smooth trilinear value noise → [0, 1]. Gradient-bounded, no discontinuities. */
function valueNoise(x, y, z) {
  const ix = Math.floor(x), fx = x - ix
  const iy = Math.floor(y), fy = y - iy
  const iz = Math.floor(z), fz = z - iz
  const ux = _fade(fx), uy = _fade(fy), uz = _fade(fz)
  return _mix(
    _mix(_mix(ihash(ix,   iy,   iz),   ihash(ix+1, iy,   iz),   ux),
         _mix(ihash(ix,   iy+1, iz),   ihash(ix+1, iy+1, iz),   ux), uy),
    _mix(_mix(ihash(ix,   iy,   iz+1), ihash(ix+1, iy,   iz+1), ux),
         _mix(ihash(ix,   iy+1, iz+1), ihash(ix+1, iy+1, iz+1), ux), uy),
    uz
  )
}

/**
 * Fractional Brownian motion using smooth value noise.
 * Returns a value in approximately [-1, 1].
 * freq=2 gives base features ~250 world-units wide on a radius-500 planet.
 */
export function fbm(x, y, z, octaves = 5) {
  let v = 0, amp = 0.5, freq = 2
  for (let o = 0; o < octaves; o++) {
    v   += amp * (valueNoise(x * freq, y * freq, z * freq) * 2 - 1)
    amp  *= 0.5
    freq *= 2.1
  }
  return v
}

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
