import { defineStore } from 'pinia'
import { getGame, summarizeFromSens, type Game, type SensSummary } from '~~/lib/index'

const STORAGE_KEY = 'sens-calc:v1'

export type CalculatorMode = 'sens-to-edpi' | 'edpi-to-sens'

interface SettingsState {
  dpi: number
  gameSlug: string
  mode: CalculatorMode
  sens: number
  edpi: number
  calibrations: Record<string, number>
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    dpi: 800,
    gameSlug: 'cs2',
    mode: 'sens-to-edpi',
    sens: 1,
    edpi: 800,
    calibrations: {}
  }),

  getters: {
    game(state): Game {
      return getGame(state.gameSlug) ?? getGame('cs2')!
    },

    yawOverride(state): number | undefined {
      return state.calibrations[state.gameSlug]
    },

    summary(): SensSummary | null {
      try {
        return summarizeFromSens(this.game, this.dpi, this.sens, this.yawOverride)
      } catch {
        return null
      }
    },

    error(): string | null {
      try {
        summarizeFromSens(this.game, this.dpi, this.sens, this.yawOverride)
        return null
      } catch (err) {
        return err instanceof Error ? err.message : 'Error de cálculo'
      }
    }
  },

  actions: {
    setGame(slug: string) {
      this.gameSlug = slug
      this.persist()
    },

    setDpi(value: number) {
      if (!Number.isFinite(value) || value <= 0) return
      this.dpi = value
      if (this.mode === 'sens-to-edpi') {
        this.edpi = this.dpi * this.sens
      } else {
        this.sens = this.edpi / this.dpi
      }
      this.persist()
    },

    setSens(value: number) {
      if (!Number.isFinite(value) || value <= 0) return
      this.sens = value
      this.edpi = this.dpi * value
      this.persist()
    },

    setEdpi(value: number) {
      if (!Number.isFinite(value) || value <= 0) return
      this.edpi = value
      this.sens = value / this.dpi
      this.persist()
    },

    setMode(mode: CalculatorMode) {
      this.mode = mode
      this.persist()
    },

    saveCalibration(slug: string, yaw: number) {
      if (!Number.isFinite(yaw) || yaw <= 0) return
      this.calibrations = { ...this.calibrations, [slug]: yaw }
      this.persist()
    },

    clearCalibration(slug: string) {
      const next = { ...this.calibrations }
      delete next[slug]
      this.calibrations = next
      this.persist()
    },

    persist() {
      if (typeof window === 'undefined') return
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          dpi: this.dpi,
          gameSlug: this.gameSlug,
          mode: this.mode,
          sens: this.sens,
          edpi: this.edpi,
          calibrations: this.calibrations
        })
      )
    },

    hydrate() {
      if (typeof window === 'undefined') return
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      try {
        const parsed = JSON.parse(raw) as Partial<SettingsState>
        if (typeof parsed.dpi === 'number') this.dpi = parsed.dpi
        if (typeof parsed.gameSlug === 'string') this.gameSlug = parsed.gameSlug
        if (parsed.mode === 'sens-to-edpi' || parsed.mode === 'edpi-to-sens') this.mode = parsed.mode
        if (typeof parsed.sens === 'number') this.sens = parsed.sens
        if (typeof parsed.edpi === 'number') this.edpi = parsed.edpi
        if (parsed.calibrations && typeof parsed.calibrations === 'object') {
          this.calibrations = parsed.calibrations as Record<string, number>
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    }
  }
})
