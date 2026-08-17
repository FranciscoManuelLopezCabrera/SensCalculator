const DEG = Math.PI / 180

function requireFov(value: number, name: string): number {
  if (!Number.isFinite(value) || value <= 0 || value >= 180) {
    throw new RangeError(`${name} must be a finite angle in (0, 180), received ${value}`)
  }
  return value
}

function requirePositive(value: number, name: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite positive number, received ${value}`)
  }
  return value
}

export function hFovFromVFov(vFovDeg: number, aspect: number): number {
  const v = requireFov(vFovDeg, 'vFovDeg')
  const ar = requirePositive(aspect, 'aspect')
  return (2 * Math.atan(ar * Math.tan((v * DEG) / 2))) / DEG
}

export function vFovFromHFov(hFovDeg: number, aspect: number): number {
  const h = requireFov(hFovDeg, 'hFovDeg')
  const ar = requirePositive(aspect, 'aspect')
  return (2 * Math.atan(Math.tan((h * DEG) / 2) / ar)) / DEG
}

export function zoomSensRatio(hipHFovDeg: number, zoomHFovDeg: number, monitorDistance: number): number {
  const hip = requireFov(hipHFovDeg, 'hipHFovDeg')
  const zoom = requireFov(zoomHFovDeg, 'zoomHFovDeg')

  if (!Number.isFinite(monitorDistance) || monitorDistance < 0 || monitorDistance > 1) {
    throw new RangeError(`monitorDistance must be within [0, 1], received ${monitorDistance}`)
  }

  const tanHip = Math.tan((hip * DEG) / 2)
  const tanZoom = Math.tan((zoom * DEG) / 2)

  if (monitorDistance === 0) {
    return tanZoom / tanHip
  }

  return Math.atan(monitorDistance * tanZoom) / Math.atan(monitorDistance * tanHip)
}
