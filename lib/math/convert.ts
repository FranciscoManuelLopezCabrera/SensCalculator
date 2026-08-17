import { REFERENCE_YAW } from '../games'

export interface ConvertInput {
  sens: number
  fromYaw: number
  toYaw: number
  fromDpi?: number
  toDpi?: number
}

function requirePositive(value: number, name: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite positive number, received ${value}`)
  }
  return value
}

export function convertSens(input: ConvertInput): number {
  const sens = requirePositive(input.sens, 'sens')
  const fromYaw = requirePositive(input.fromYaw, 'fromYaw')
  const toYaw = requirePositive(input.toYaw, 'toYaw')
  const fromDpi = requirePositive(input.fromDpi ?? 800, 'fromDpi')
  const toDpi = requirePositive(input.toDpi ?? input.fromDpi ?? 800, 'toDpi')

  return sens * (fromYaw / toYaw) * (fromDpi / toDpi)
}

export function convertEdpi(edpi: number, fromYaw: number, toYaw: number): number {
  return requirePositive(edpi, 'edpi') * (requirePositive(fromYaw, 'fromYaw') / requirePositive(toYaw, 'toYaw'))
}

export function normalizedEdpi(edpi: number, yaw: number, referenceYaw: number = REFERENCE_YAW): number {
  return requirePositive(edpi, 'edpi') * (requirePositive(yaw, 'yaw') / requirePositive(referenceYaw, 'referenceYaw'))
}
