import { describe, it, expect } from 'vitest'
import { yawFromMeasurement } from '~~/lib/math/calibrate'
import { cm360FromSens } from '~~/lib/math/core'

describe('yawFromMeasurement', () => {
  it('vector 13: recovers the cs2 yaw from a 51.95 cm measurement', () => {
    expect(yawFromMeasurement({ dpi: 800, sens: 1, measuredCm: 51.9545 })).toBeCloseTo(0.022, 6)
  })

  it('divides the measured distance by the number of turns', () => {
    expect(yawFromMeasurement({ dpi: 800, sens: 1, measuredCm: 519.545, turns: 10 }))
      .toBeCloseTo(0.022, 6)
  })

  it('round-trips against the core math', () => {
    const yaw = yawFromMeasurement({ dpi: 1600, sens: 0.5, measuredCm: 34.64 })
    expect(cm360FromSens(1600, 0.5, yaw)).toBeCloseTo(34.64, 6)
  })

  it('recovers the overwatch 2 yaw', () => {
    expect(yawFromMeasurement({ dpi: 800, sens: 5, measuredCm: 34.6363 })).toBeCloseTo(0.0066, 6)
  })

  it('rejects invalid input', () => {
    expect(() => yawFromMeasurement({ dpi: 0, sens: 1, measuredCm: 50 })).toThrow(RangeError)
    expect(() => yawFromMeasurement({ dpi: 800, sens: 1, measuredCm: 0 })).toThrow(RangeError)
    expect(() => yawFromMeasurement({ dpi: 800, sens: 1, measuredCm: 50, turns: 0 })).toThrow(RangeError)
    expect(() => yawFromMeasurement({ dpi: 800, sens: 1, measuredCm: 50, turns: 1.5 })).toThrow(RangeError)
  })
})
