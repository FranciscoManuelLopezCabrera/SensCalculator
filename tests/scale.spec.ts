import { describe, it, expect } from 'vitest'
import { buildScale } from '~~/lib/scale'

describe('buildScale', () => {
  it('places the index proportionally inside the pad', () => {
    const scale = buildScale(30)
    expect(scale.padWidthCm).toBe(45)
    expect(scale.indexPct).toBeCloseTo(66.6667, 3)
    expect(scale.overflows).toBe(false)
    expect(scale.padWidths).toBeCloseTo(0.6667, 4)
  })

  it('clamps and flags a turn wider than the pad', () => {
    const scale = buildScale(51.9545)
    expect(scale.indexPct).toBe(100)
    expect(scale.overflows).toBe(true)
    expect(scale.padWidths).toBeCloseTo(1.1545, 4)
  })

  it('emits a labelled tick every five centimetres', () => {
    expect(buildScale(30).majorTicks).toEqual([0, 5, 10, 15, 20, 25, 30, 35, 40, 45])
  })

  it('emits an unlabelled tick on every other centimetre', () => {
    const scale = buildScale(30)
    expect(scale.minorTicks).toHaveLength(36)
    expect(scale.minorTicks).not.toContain(5)
    expect(scale.minorTicks).toContain(6)
  })

  it('accepts a custom pad width', () => {
    const scale = buildScale(30, 60)
    expect(scale.indexPct).toBeCloseTo(50, 6)
    expect(scale.majorTicks.at(-1)).toBe(60)
  })

  it('rejects invalid input', () => {
    expect(() => buildScale(0)).toThrow(RangeError)
    expect(() => buildScale(30, 0)).toThrow(RangeError)
    expect(() => buildScale(Number.NaN)).toThrow(RangeError)
  })
})
