import { describe, it, expect } from 'vitest'
import { quantizeSens, formatSens } from '~~/lib/math/quantize'
import type { SensInputSpec } from '~~/lib/types'

const OW2: SensInputSpec = { min: 1, max: 100, step: 1, decimals: 0 }
const VALORANT: SensInputSpec = { min: 0.001, max: 10, step: 0.001, decimals: 3 }
const CS2: SensInputSpec = { min: 0.0001, max: 100, step: 0, decimals: 6 }

describe('quantizeSens', () => {
  it('vector 12: rounds overwatch 5.7727 to 6 with ~3.94% error', () => {
    const result = quantizeSens(5.7727, OW2)
    expect(result.value).toBe(6)
    expect(result.exact).toBeCloseTo(5.7727, 4)
    expect(result.errorPct).toBeCloseTo(3.9375, 3)
    expect(result.clamped).toBe(false)
  })

  it('leaves continuous scales untouched', () => {
    const result = quantizeSens(1.234567, CS2)
    expect(result.value).toBeCloseTo(1.234567, 6)
    expect(result.errorPct).toBeCloseTo(0, 6)
  })

  it('rounds to the valorant step', () => {
    expect(quantizeSens(0.3142857, VALORANT).value).toBeCloseTo(0.314, 6)
  })

  it('clamps below the minimum', () => {
    const result = quantizeSens(0.4, OW2)
    expect(result.value).toBe(1)
    expect(result.clamped).toBe(true)
  })

  it('clamps above the maximum', () => {
    const result = quantizeSens(140, OW2)
    expect(result.value).toBe(100)
    expect(result.clamped).toBe(true)
  })

  it('does not leak floating point noise', () => {
    expect(quantizeSens(0.30000000000000004, VALORANT).value).toBe(0.3)
  })

  it('rejects invalid input', () => {
    expect(() => quantizeSens(0, OW2)).toThrow(RangeError)
    expect(() => quantizeSens(Number.NaN, OW2)).toThrow(RangeError)
  })
})

describe('formatSens', () => {
  it('formats with the declared decimals', () => {
    expect(formatSens(6, OW2)).toBe('6')
    expect(formatSens(0.314, VALORANT)).toBe('0.314')
  })

  it('trims trailing zeros on continuous scales', () => {
    expect(formatSens(1.5, CS2)).toBe('1.5')
  })
})
