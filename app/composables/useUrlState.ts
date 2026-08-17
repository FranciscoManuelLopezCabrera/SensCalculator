import { watch } from 'vue'
import { getGame } from '~~/lib/games'
import { useSettingsStore, type CalculatorMode } from '~/stores/settings'

export interface UrlState {
  game: string
  dpi: number
  sens: number
  mode: string
}

export function encodeState(state: UrlState): string {
  return new URLSearchParams({
    game: state.game,
    dpi: String(state.dpi),
    sens: String(state.sens),
    mode: state.mode
  }).toString()
}

export function decodeState(query: Record<string, string | undefined>): Partial<UrlState> {
  const result: Partial<UrlState> = {}

  if (query.game && getGame(query.game)) {
    result.game = query.game
  }

  const dpi = Number(query.dpi)
  if (query.dpi !== undefined && Number.isFinite(dpi) && dpi > 0) {
    result.dpi = dpi
  }

  const sens = Number(query.sens)
  if (query.sens !== undefined && Number.isFinite(sens) && sens > 0) {
    result.sens = sens
  }

  if (query.mode === 'sens-to-edpi' || query.mode === 'edpi-to-sens') {
    result.mode = query.mode
  }

  return result
}

export function useUrlState() {
  const store = useSettingsStore()
  const route = useRoute()
  const router = useRouter()

  const incoming = decodeState(route.query as Record<string, string | undefined>)
  if (incoming.game) store.setGame(incoming.game)
  if (incoming.dpi) store.setDpi(incoming.dpi)
  if (incoming.sens) store.setSens(incoming.sens)
  if (incoming.mode) store.setMode(incoming.mode as CalculatorMode)

  watch(
    () => [store.gameSlug, store.dpi, store.sens, store.mode],
    () => {
      router.replace({
        query: {
          game: store.gameSlug,
          dpi: String(store.dpi),
          sens: String(store.sens),
          mode: store.mode
        }
      })
    }
  )
}
