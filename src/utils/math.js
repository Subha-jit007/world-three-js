/** Deterministic pseudo-random value in [0, 1] */
export function hash(x, y, z) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453
  return s - Math.floor(s)
}

/** Fractional Brownian motion — layered hash noise */
export function fbm(x, y, z, octaves = 5) {
  let value = 0, amp = 0.5, freq = 1
  for (let o = 0; o < octaves; o++) {
    value += amp * (hash(x * freq, y * freq, z * freq) * 2 - 1)
    amp   *= 0.5
    freq  *= 2.1
  }
  return value
}

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
