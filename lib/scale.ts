export interface ScaleGeometry {
  cm360: number
  padWidthCm: number
  indexPct: number
  overflows: boolean
  padWidths: number
  majorTicks: number[]
  minorTicks: number[]
}

export const DEFAULT_PAD_WIDTH_CM = 45
export const MAJOR_TICK_EVERY_CM = 5

function requirePositive(value: number, name: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite positive number, received ${value}`)
  }
  return value
}

export function buildScale(cm360: number, padWidthCm: number = DEFAULT_PAD_WIDTH_CM): ScaleGeometry {
  const turn = requirePositive(cm360, 'cm360')
  const pad = requirePositive(padWidthCm, 'padWidthCm')

  const majorTicks: number[] = []
  const minorTicks: number[] = []

  for (let cm = 0; cm <= Math.floor(pad); cm += 1) {
    if (cm % MAJOR_TICK_EVERY_CM === 0) {
      majorTicks.push(cm)
    } else {
      minorTicks.push(cm)
    }
  }

  return {
    cm360: turn,
    padWidthCm: pad,
    indexPct: Math.min(turn / pad, 1) * 100,
    overflows: turn > pad,
    padWidths: turn / pad,
    majorTicks,
    minorTicks
  }
}
