import { describe, it, expect } from 'vitest'
import { convertSens, convertEdpi, normalizedEdpi } from '~~/lib/math/convert'
import { cm360FromSens } from '~~/lib/math/core'

describe('convertSens', () => {
  it('vector 4: cs2 1.0 to valorant', () => {
    expect(convertSens({ sens: 1, fromYaw: 0.022, toYaw: 0.07 })).toBeCloseTo(0.3142857, 6)
  })

  it('vector 5: cs2 1.0 to overwatch 2', () => {
    expect(convertSens({ sens: 1, fromYaw: 0.022, toYaw: 0.0066 })).toBeCloseTo(3.3333333, 6)
  })

  it('vector 6: cs2 2.0 to valorant', () => {
    expect(convertSens({ sens: 2, fromYaw: 0.022, toYaw: 0.07 })).toBeCloseTo(0.6285714, 6)
  })

  it('vector 7: cs2 1.0 at 400 dpi to valorant at 800 dpi', () => {
    expect(convertSens({ sens: 1, fromYaw: 0.022, toYaw: 0.07, fromDpi: 400, toDpi: 800 }))
      .toBeCloseTo(0.1571428, 6)
  })

  it('vector 8: fortnite 7% to cs2', () => {
    expect(convertSens({ sens: 7, fromYaw: 0.005555, toYaw: 0.022 })).toBeCloseTo(1.7675, 4)
  })

  it('vector 9: cs2 1.768 to fortnite', () => {
    expect(convertSens({ sens: 1.768, fromYaw: 0.022, toYaw: 0.005555 })).toBeCloseTo(7.001980198, 4)
  })

  it('is the identity when both games share a yaw', () => {
    expect(convertSens({ sens: 1.4, fromYaw: 0.022, toYaw: 0.022 })).toBeCloseTo(1.4, 6)
  })

  it('preserves cm/360 exactly', () => {
    const converted = convertSens({ sens: 1, fromYaw: 0.022, toYaw: 0.07, fromDpi: 400, toDpi: 800 })
    expect(cm360FromSens(800, converted, 0.07)).toBeCloseTo(cm360FromSens(400, 1, 0.022), 6)
  })

  it('is reversible', () => {
    const there = convertSens({ sens: 2.3, fromYaw: 0.022, toYaw: 0.0066 })
    expect(convertSens({ sens: there, fromYaw: 0.0066, toYaw: 0.022 })).toBeCloseTo(2.3, 6)
  })

  it('rejects invalid input', () => {
    expect(() => convertSens({ sens: 0, fromYaw: 0.022, toYaw: 0.07 })).toThrow(RangeError)
    expect(() => convertSens({ sens: 1, fromYaw: 0.022, toYaw: 0 })).toThrow(RangeError)
  })
})

describe('normalizedEdpi', () => {
  it('vector 14: overwatch 2 edpi 4000 equals cs2 edpi 1200', () => {
    expect(normalizedEdpi(4000, 0.0066)).toBeCloseTo(1200, 6)
  })

  it('leaves cs2 untouched', () => {
    expect(normalizedEdpi(800, 0.022)).toBeCloseTo(800, 6)
  })

  it('accepts a custom reference yaw', () => {
    expect(normalizedEdpi(800, 0.022, 0.07)).toBeCloseTo(251.42857, 5)
  })
})

describe('convertEdpi', () => {
  it('scales edpi by the yaw ratio', () => {
    expect(convertEdpi(800, 0.022, 0.0066)).toBeCloseTo(2666.6666, 3)
  })
})
