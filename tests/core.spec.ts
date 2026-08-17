import { describe, it, expect } from 'vitest'
import {
  INCH_TO_CM,
  FULL_TURN_CM,
  edpiFromSens,
  sensFromEdpi,
  degPerCount,
  countsPer360,
  cm360FromSens,
  cm360FromEdpi,
  sensFromCm360,
  edpiFromCm360,
  cmToInches
} from '~~/lib/math/core'

describe('core sensitivity math', () => {
  it('exposes the physical constants', () => {
    expect(INCH_TO_CM).toBe(2.54)
    expect(FULL_TURN_CM).toBeCloseTo(914.4, 6)
  })

  it('vector 1: cs2 at 800 dpi and sens 1.0', () => {
    expect(edpiFromSens(800, 1)).toBe(800)
    expect(degPerCount(1, 0.022)).toBeCloseTo(0.022, 6)
    expect(countsPer360(1, 0.022)).toBeCloseTo(16363.6364, 3)
    expect(cmToInches(cm360FromSens(800, 1, 0.022))).toBeCloseTo(20.4545, 4)
    expect(cm360FromSens(800, 1, 0.022)).toBeCloseTo(51.9545, 4)
  })

  it('vector 2: cm/360 depends only on edpi, not on the dpi split', () => {
    expect(cm360FromSens(400, 2, 0.022)).toBeCloseTo(51.9545, 4)
    expect(cm360FromSens(1600, 0.5, 0.022)).toBeCloseTo(51.9545, 4)
  })

  it('vector 3: valorant at 800 dpi and sens 0.314', () => {
    expect(edpiFromSens(800, 0.314)).toBeCloseTo(251.2, 4)
    expect(cm360FromSens(800, 0.314, 0.07)).toBeCloseTo(52.0018, 4)
  })

  it('vector 10: edpi 800 to cm/360 in cs2', () => {
    expect(cm360FromEdpi(800, 0.022)).toBeCloseTo(51.9545, 4)
  })

  it('vector 11: 30 cm/360 in overwatch 2', () => {
    expect(edpiFromCm360(30, 0.0066)).toBeCloseTo(4618.1818, 3)
    expect(sensFromCm360(800, 30, 0.0066)).toBeCloseTo(5.7727, 4)
  })

  it('vector 15: call of duty sens 6 at 800 dpi', () => {
    expect(cm360FromSens(800, 6, 0.0066)).toBeCloseTo(28.8636, 4)
  })

  it('inverts sens and edpi', () => {
    expect(sensFromEdpi(1600, 800)).toBeCloseTo(0.5, 6)
    expect(edpiFromSens(1600, sensFromEdpi(1600, 800))).toBeCloseTo(800, 6)
  })

  it('round-trips sens through cm/360', () => {
    const cm = cm360FromSens(800, 1.37, 0.022)
    expect(sensFromCm360(800, cm, 0.022)).toBeCloseTo(1.37, 6)
  })

  it('rejects non-positive and non-finite inputs', () => {
    expect(() => cm360FromSens(0, 1, 0.022)).toThrow(RangeError)
    expect(() => cm360FromSens(800, 0, 0.022)).toThrow(RangeError)
    expect(() => cm360FromSens(800, 1, 0)).toThrow(RangeError)
    expect(() => sensFromEdpi(0, 800)).toThrow(RangeError)
    expect(() => cm360FromSens(Number.NaN, 1, 0.022)).toThrow(RangeError)
    expect(() => cm360FromSens(Number.POSITIVE_INFINITY, 1, 0.022)).toThrow(RangeError)
  })
})
