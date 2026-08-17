export const INCH_TO_CM = 2.54
export const FULL_TURN_DEGREES = 360
export const FULL_TURN_CM = FULL_TURN_DEGREES * INCH_TO_CM

function requirePositive(value: number, name: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite positive number, received ${value}`)
  }
  return value
}

export function cmToInches(cm: number): number {
  return requirePositive(cm, 'cm') / INCH_TO_CM
}

export function edpiFromSens(dpi: number, sens: number): number {
  return requirePositive(dpi, 'dpi') * requirePositive(sens, 'sens')
}

export function sensFromEdpi(dpi: number, edpi: number): number {
  return requirePositive(edpi, 'edpi') / requirePositive(dpi, 'dpi')
}

export function degPerCount(sens: number, yaw: number): number {
  return requirePositive(sens, 'sens') * requirePositive(yaw, 'yaw')
}

export function countsPer360(sens: number, yaw: number): number {
  return FULL_TURN_DEGREES / degPerCount(sens, yaw)
}

export function cm360FromSens(dpi: number, sens: number, yaw: number): number {
  return FULL_TURN_CM / (requirePositive(dpi, 'dpi') * degPerCount(sens, yaw))
}

export function cm360FromEdpi(edpi: number, yaw: number): number {
  return FULL_TURN_CM / (requirePositive(edpi, 'edpi') * requirePositive(yaw, 'yaw'))
}

export function sensFromCm360(dpi: number, cm360: number, yaw: number): number {
  return FULL_TURN_CM / (requirePositive(dpi, 'dpi') * requirePositive(yaw, 'yaw') * requirePositive(cm360, 'cm360'))
}

export function edpiFromCm360(cm360: number, yaw: number): number {
  return FULL_TURN_CM / (requirePositive(yaw, 'yaw') * requirePositive(cm360, 'cm360'))
}
