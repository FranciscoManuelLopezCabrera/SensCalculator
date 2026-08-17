import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfidenceMark from '~/components/ConfidenceMark.vue'

describe('ConfidenceMark', () => {
  it('labels tier A as verified', () => {
    expect(mount(ConfidenceMark, { props: { confidence: 'A' } }).text()).toContain('Verificado')
  })

  it('labels tier B as unconfirmed', () => {
    expect(mount(ConfidenceMark, { props: { confidence: 'B' } }).text()).toContain('Sin confirmar')
  })

  it('labels tier C as needing calibration', () => {
    expect(mount(ConfidenceMark, { props: { confidence: 'C' } }).text()).toContain('Requiere calibración')
  })

  it('shows the tier code in the data face', () => {
    const wrapper = mount(ConfidenceMark, { props: { confidence: 'B' } })
    expect(wrapper.find('.data').text()).toBe('B')
  })

  it('exposes the note as a title attribute', () => {
    const wrapper = mount(ConfidenceMark, { props: { confidence: 'B', note: 'Fuente única' } })
    expect(wrapper.attributes('title')).toBe('Fuente única')
  })

  it('uses the accent colour only on tier C', () => {
    expect(mount(ConfidenceMark, { props: { confidence: 'A' } }).html()).not.toContain('text-index')
    expect(mount(ConfidenceMark, { props: { confidence: 'B' } }).html()).not.toContain('text-index')
    expect(mount(ConfidenceMark, { props: { confidence: 'C' } }).html()).toContain('text-index')
  })

  it('never renders a pill or a rounded corner', () => {
    for (const confidence of ['A', 'B', 'C'] as const) {
      expect(mount(ConfidenceMark, { props: { confidence } }).html()).not.toMatch(/rounded/)
    }
  })
})
