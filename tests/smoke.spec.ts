import { describe, it, expect } from 'vitest'
import { INCH_TO_CM } from '~~/lib/math/core'

describe('toolchain', () => {
  it('resolves the ~~ alias into lib', () => {
    expect(INCH_TO_CM).toBe(2.54)
  })
})
