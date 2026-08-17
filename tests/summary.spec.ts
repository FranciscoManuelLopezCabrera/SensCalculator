import { describe, it, expect } from 'vitest'
import { summarizeFromSens, summarizeFromEdpi, summarizeFromCm360, resolveYaw } from '~~/lib/index'
import { getGame } from '~~/lib/games'

const cs2 = getGame('cs2')!
const ow2 = getGame('overwatch-2')!
const pubg = getGame('pubg')!

describe('summarizeFromSens', () => {
  it('summarizes cs2 at 800 dpi and sens 1', () => {
    const s = summarizeFromSens(cs2, 800, 1)
    expect(s.edpi).toBeCloseTo(800, 6)
    expect(s.cm360).toBeCloseTo(51.9545, 4)
    expect(s.in360).toBeCloseTo(20.4545, 4)
    expect(s.normalizedEdpi).toBeCloseTo(800, 6)
    expect(s.yawSource).toBe('published')
    expect(s.verdict).toBe('lenta')
  })

  it('classifies a fast setup', () => {
    expect(summarizeFromSens(cs2, 800, 2).verdict).toBe('rapida')
  })
})

describe('summarizeFromEdpi', () => {
  it('inverts edpi into the game sensitivity', () => {
    const s = summarizeFromEdpi(ow2, 800, 4000)
    expect(s.sens).toBeCloseTo(5, 6)
    expect(s.sensQuantized.value).toBe(5)
    expect(s.cm360).toBeCloseTo(34.63636, 5)
    expect(s.normalizedEdpi).toBeCloseTo(1200, 6)
  })

  it('reports the quantization error for integer scales', () => {
    const s = summarizeFromEdpi(ow2, 800, 4618.1818)
    expect(s.sens).toBeCloseTo(5.7727, 4)
    expect(s.sensQuantized.value).toBe(6)
    expect(s.sensQuantized.errorPct).toBeCloseTo(3.9375, 3)
  })
})

describe('summarizeFromCm360', () => {
  it('inverts cm/360 into sens and edpi', () => {
    const s = summarizeFromCm360(cs2, 800, 51.9545)
    expect(s.sens).toBeCloseTo(1, 5)
    expect(s.edpi).toBeCloseTo(800.0007, 4)
  })
})

describe('resolveYaw', () => {
  it('uses the published yaw when there is no override', () => {
    expect(resolveYaw(cs2)).toEqual({ yaw: 0.022, source: 'published' })
  })

  it('prefers the override and marks it as calibrated', () => {
    expect(resolveYaw(cs2, 0.0215)).toEqual({ yaw: 0.0215, source: 'calibrated' })
  })

  it('throws for tier C games without a calibration', () => {
    expect(() => resolveYaw(pubg)).toThrow(/calibra/i)
  })

  it('accepts a tier C game once calibrated', () => {
    expect(resolveYaw(pubg, 0.0008)).toEqual({ yaw: 0.0008, source: 'calibrated' })
  })
})
