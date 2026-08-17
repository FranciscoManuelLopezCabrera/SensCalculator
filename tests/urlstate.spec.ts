import { describe, it, expect } from 'vitest'
import { encodeState, decodeState } from '~/composables/useUrlState'

describe('encodeState', () => {
  it('serializes the full state', () => {
    const encoded = encodeState({ game: 'valorant', dpi: 800, sens: 0.314, mode: 'sens-to-edpi' })
    expect(encoded).toBe('game=valorant&dpi=800&sens=0.314&mode=sens-to-edpi')
  })
})

describe('decodeState', () => {
  it('parses valid values', () => {
    expect(decodeState({ game: 'cs2', dpi: '1600', sens: '2', mode: 'edpi-to-sens' }))
      .toEqual({ game: 'cs2', dpi: 1600, sens: 2, mode: 'edpi-to-sens' })
  })

  it('drops unknown games', () => {
    expect(decodeState({ game: 'nope' })).toEqual({})
  })

  it('drops non-positive numbers', () => {
    expect(decodeState({ dpi: '0', sens: '-1' })).toEqual({})
  })

  it('drops unknown modes', () => {
    expect(decodeState({ mode: 'weird' })).toEqual({})
  })

  it('returns an empty object for an empty query', () => {
    expect(decodeState({})).toEqual({})
  })
})
