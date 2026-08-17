import { FULL_TURN_CM } from './core'

export interface CalibrationInput {
  dpi: number
  sens: number
  measuredCm: number
  turns?: number
}

export interface Calibration {
  gameSlug: string
  yaw: number
  dpi: number
  sens: number
  measuredCm: number
  turns: number
}

function requirePositive(value: number, name: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite positive number, received ${value}`)
  }
  return value
}

export function yawFromMeasurement(input: CalibrationInput): number {
  const dpi = requirePositive(input.dpi, 'dpi')
  const sens = requirePositive(input.sens, 'sens')
  const measuredCm = requirePositive(input.measuredCm, 'measuredCm')
  const turns = requirePositive(input.turns ?? 1, 'turns')

  if (!Number.isInteger(turns)) {
    throw new RangeError(`turns must be an integer, received ${turns}`)
  }

  const cm360 = measuredCm / turns
  return FULL_TURN_CM / (dpi * sens * cm360)
}
