import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from '~/stores/settings'

describe('settings store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('starts on cs2 at 800 dpi', () => {
    const store = useSettingsStore()
    expect(store.gameSlug).toBe('cs2')
    expect(store.dpi).toBe(800)
    expect(store.summary?.cm360).toBeCloseTo(51.9545, 4)
  })

  it('keeps sens and edpi in sync when the mode changes', () => {
    const store = useSettingsStore()
    store.setSens(2)
    expect(store.edpi).toBeCloseTo(1600, 6)
    store.setEdpi(400)
    expect(store.sens).toBeCloseTo(0.5, 6)
  })

  it('recomputes edpi when the dpi changes in sens mode', () => {
    const store = useSettingsStore()
    store.setMode('sens-to-edpi')
    store.setSens(1)
    store.setDpi(1600)
    expect(store.edpi).toBeCloseTo(1600, 6)
  })

  it('recomputes sens when the dpi changes in edpi mode', () => {
    const store = useSettingsStore()
    store.setMode('edpi-to-sens')
    store.setEdpi(800)
    store.setDpi(1600)
    expect(store.sens).toBeCloseTo(0.5, 6)
  })

  it('surfaces an error for tier C games without calibration', () => {
    const store = useSettingsStore()
    store.setGame('pubg')
    expect(store.summary).toBeNull()
    expect(store.error).toMatch(/calibra/i)
  })

  it('uses a saved calibration as the yaw', () => {
    const store = useSettingsStore()
    store.setGame('pubg')
    store.saveCalibration('pubg', 0.0008)
    expect(store.error).toBeNull()
    expect(store.summary?.yaw).toBeCloseTo(0.0008, 8)
    expect(store.summary?.yawSource).toBe('calibrated')
  })

  it('persists and rehydrates', () => {
    const store = useSettingsStore()
    store.setDpi(1600)
    store.setGame('valorant')
    store.saveCalibration('pubg', 0.0008)

    setActivePinia(createPinia())
    const fresh = useSettingsStore()
    fresh.hydrate()
    expect(fresh.dpi).toBe(1600)
    expect(fresh.gameSlug).toBe('valorant')
    expect(fresh.calibrations.pubg).toBeCloseTo(0.0008, 8)
  })
})
