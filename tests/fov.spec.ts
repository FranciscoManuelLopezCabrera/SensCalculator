import { describe, it, expect } from 'vitest'
import { hFovFromVFov, vFovFromHFov, zoomSensRatio } from '~~/lib/math/fov'

describe('fov conversion', () => {
  it('vector 16: 73.74 vertical at 16:9 is 106.26 horizontal', () => {
    expect(hFovFromVFov(73.74, 16 / 9)).toBeCloseTo(106.26, 2)
  })

  it('round-trips horizontal and vertical', () => {
    expect(vFovFromHFov(hFovFromVFov(73.74, 16 / 9), 16 / 9)).toBeCloseTo(73.74, 6)
  })
})

describe('zoomSensRatio', () => {
  it('returns 1 when the fov does not change', () => {
    expect(zoomSensRatio(103, 103, 0)).toBeCloseTo(1, 6)
    expect(zoomSensRatio(103, 103, 1)).toBeCloseTo(1, 6)
  })

  it('at monitor distance 1 it equals the plain fov ratio', () => {
    expect(zoomSensRatio(103, 51.5, 1)).toBeCloseTo(0.5, 6)
  })

  it('at monitor distance 0 it equals the tangent ratio', () => {
    const expected = Math.tan((51.5 * Math.PI) / 360) / Math.tan((103 * Math.PI) / 360)
    expect(zoomSensRatio(103, 51.5, 0)).toBeCloseTo(expected, 6)
  })

  it('is slower at 0 than at 1 when zooming in', () => {
    expect(zoomSensRatio(103, 51.5, 0)).toBeLessThan(zoomSensRatio(103, 51.5, 1))
  })

  it('rejects invalid input', () => {
    expect(() => zoomSensRatio(0, 51.5, 0)).toThrow(RangeError)
    expect(() => zoomSensRatio(103, 51.5, -0.1)).toThrow(RangeError)
    expect(() => zoomSensRatio(103, 51.5, 1.1)).toThrow(RangeError)
    expect(() => hFovFromVFov(200, 16 / 9)).toThrow(RangeError)
  })
})
