import type { SensInputSpec } from '../types'

export interface QuantizedSens {
  exact: number
  value: number
  clamped: boolean
  errorPct: number
}

function roundToStep(value: number, step: number, decimals: number): number {
  const stepped = Math.round(value / step) * step
  const guard = Math.max(decimals, 6)
  return Number(stepped.toFixed(guard))
}

export function quantizeSens(exact: number, spec: SensInputSpec): QuantizedSens {
  if (!Number.isFinite(exact) || exact <= 0) {
    throw new RangeError(`sens must be a finite positive number, received ${exact}`)
  }

  const stepped = spec.step > 0 ? roundToStep(exact, spec.step, spec.decimals) : exact
  const value = Math.min(Math.max(stepped, spec.min), spec.max)
  const clamped = exact < spec.min || exact > spec.max

  return {
    exact,
    value,
    clamped,
    errorPct: (Math.abs(value - exact) / exact) * 100
  }
}

export function formatSens(value: number, spec: SensInputSpec): string {
  if (spec.step > 0) {
    return value.toFixed(spec.decimals)
  }
  return String(Number(value.toFixed(spec.decimals)))
}
