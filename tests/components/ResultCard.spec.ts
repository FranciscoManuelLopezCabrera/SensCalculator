import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ResultCard from '~/components/ResultCard.vue'
import { getGame, summarizeFromSens, summarizeFromEdpi } from '~~/lib/index'

const cs2 = getGame('cs2')!
const ow2 = getGame('overwatch-2')!

describe('ResultCard', () => {
  it('shows cm/360, edpi and normalized edpi', () => {
    const wrapper = mount(ResultCard, {
      props: { summary: summarizeFromSens(cs2, 800, 1), error: null }
    })
    expect(wrapper.find('[data-test="cm360"]').text()).toContain('51.95')
    expect(wrapper.find('[data-test="edpi"]').text()).toContain('800')
    expect(wrapper.find('[data-test="normalized"]').text()).toContain('800')
  })

  it('warns when the usable value differs from the exact one', () => {
    const wrapper = mount(ResultCard, {
      props: { summary: summarizeFromEdpi(ow2, 800, 4618.1818), error: null }
    })
    expect(wrapper.find('[data-test="sens-usable"]').text()).toContain('6')
    expect(wrapper.find('[data-test="quantize-warning"]').exists()).toBe(true)
  })

  it('hides the warning when quantization is negligible', () => {
    const wrapper = mount(ResultCard, {
      props: { summary: summarizeFromSens(cs2, 800, 1), error: null }
    })
    expect(wrapper.find('[data-test="quantize-warning"]').exists()).toBe(false)
  })

  it('renders the pro range when the game declares one', () => {
    const wrapper = mount(ResultCard, {
      props: { summary: summarizeFromSens(cs2, 800, 1), error: null }
    })
    expect(wrapper.find('[data-test="pro-range"]').text()).toContain('800')
  })

  it('renders the error instead of results', () => {
    const wrapper = mount(ResultCard, { props: { summary: null, error: 'Calibra el juego' } })
    expect(wrapper.find('[data-test="error"]').text()).toContain('Calibra el juego')
    expect(wrapper.find('[data-test="cm360"]').exists()).toBe(false)
  })

  it('leads with the scale bar', () => {
    const wrapper = mount(ResultCard, {
      props: { summary: summarizeFromSens(cs2, 800, 1), error: null }
    })
    expect(wrapper.find('[data-test="index"]').exists()).toBe(true)
  })

  it('honours the design constraints', () => {
    const html = mount(ResultCard, {
      props: { summary: summarizeFromSens(cs2, 800, 1), error: null }
    }).html()
    expect(html).not.toMatch(/rounded/)
    expect(html).not.toMatch(/shadow/)
    expect(html).not.toContain('—')
  })
})
