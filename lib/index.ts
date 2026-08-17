import type { Game } from './types'
import {
  cm360FromSens,
  cmToInches,
  countsPer360,
  degPerCount,
  edpiFromSens,
  sensFromCm360,
  sensFromEdpi
} from './math/core'
import { normalizedEdpi } from './math/convert'
import { quantizeSens, type QuantizedSens } from './math/quantize'

export * from './types'
export * from './games'
export * from './math/core'
export * from './math/convert'
export * from './math/quantize'
export * from './math/calibrate'
export * from './math/fov'

export type YawSource = 'published' | 'calibrated'
export type SpeedVerdict = 'lenta' | 'media' | 'rapida' | 'muy-rapida'

export interface SensSummary {
  game: Game
  dpi: number
  sens: number
  sensQuantized: QuantizedSens
  edpi: number
  normalizedEdpi: number
  cm360: number
  in360: number
  countsPer360: number
  degPerCount: number
  yaw: number
  yawSource: YawSource
  verdict: SpeedVerdict
}

export function resolveYaw(game: Game, yawOverride?: number): { yaw: number; source: YawSource } {
  if (yawOverride !== undefined) {
    if (!Number.isFinite(yawOverride) || yawOverride <= 0) {
      throw new RangeError(`yawOverride must be a finite positive number, received ${yawOverride}`)
    }
    return { yaw: yawOverride, source: 'calibrated' }
  }

  if (game.yaw === null) {
    throw new Error(`${game.name} no tiene una constante fiable publicada. Calibra el juego para usarlo.`)
  }

  return { yaw: game.yaw, source: 'published' }
}

export function classifySpeed(cm360: number): SpeedVerdict {
  if (cm360 < 20) return 'muy-rapida'
  if (cm360 < 35) return 'rapida'
  if (cm360 <= 50) return 'media'
  return 'lenta'
}

export function summarizeFromSens(game: Game, dpi: number, sens: number, yawOverride?: number): SensSummary {
  const { yaw, source } = resolveYaw(game, yawOverride)
  const edpi = edpiFromSens(dpi, sens)
  const cm360 = cm360FromSens(dpi, sens, yaw)

  return {
    game,
    dpi,
    sens,
    sensQuantized: quantizeSens(sens, game.input),
    edpi,
    normalizedEdpi: normalizedEdpi(edpi, yaw),
    cm360,
    in360: cmToInches(cm360),
    countsPer360: countsPer360(sens, yaw),
    degPerCount: degPerCount(sens, yaw),
    yaw,
    yawSource: source,
    verdict: classifySpeed(cm360)
  }
}

export function summarizeFromEdpi(game: Game, dpi: number, edpi: number, yawOverride?: number): SensSummary {
  return summarizeFromSens(game, dpi, sensFromEdpi(dpi, edpi), yawOverride)
}

export function summarizeFromCm360(game: Game, dpi: number, cm360: number, yawOverride?: number): SensSummary {
  const { yaw } = resolveYaw(game, yawOverride)
  return summarizeFromSens(game, dpi, sensFromCm360(dpi, cm360, yaw), yawOverride)
}
