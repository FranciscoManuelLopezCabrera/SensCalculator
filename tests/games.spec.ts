import { describe, it, expect } from 'vitest'
import { GAMES, getGame, tierAGames } from '~~/lib/games'

describe('game registry', () => {
  it('exposes the reference yaw values from the spec', () => {
    expect(getGame('cs2')?.yaw).toBe(0.022)
    expect(getGame('valorant')?.yaw).toBe(0.07)
    expect(getGame('overwatch-2')?.yaw).toBe(0.0066)
    expect(getGame('marvel-rivals')?.yaw).toBe(0.0066)
    expect(getGame('fortnite')?.yaw).toBe(0.005555)
    expect(getGame('deadlock')?.yaw).toBe(0.044)
  })

  it('has unique slugs', () => {
    const slugs = GAMES.map(g => g.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('gives every tier A and B game a positive yaw', () => {
    for (const game of GAMES.filter(g => g.confidence !== 'C')) {
      expect(game.yaw).not.toBeNull()
      expect(game.yaw as number).toBeGreaterThan(0)
    }
  })

  it('gives every tier C game a null yaw and a note', () => {
    for (const game of GAMES.filter(g => g.confidence === 'C')) {
      expect(game.yaw).toBeNull()
      expect(game.confidenceNote).toBeTruthy()
    }
  })

  it('declares coherent input specs', () => {
    for (const game of GAMES) {
      expect(game.input.max).toBeGreaterThan(game.input.min)
      expect(game.input.step).toBeGreaterThanOrEqual(0)
      expect(game.input.decimals).toBeGreaterThanOrEqual(0)
    }
  })

  it('lists only tier A games in tierAGames', () => {
    expect(tierAGames().every(g => g.confidence === 'A')).toBe(true)
    expect(tierAGames().length).toBeGreaterThanOrEqual(10)
  })

  it('returns undefined for an unknown slug', () => {
    expect(getGame('nope')).toBeUndefined()
  })
})
