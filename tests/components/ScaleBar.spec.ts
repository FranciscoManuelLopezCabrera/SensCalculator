import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ScaleBar from '~/components/ScaleBar.vue'

describe('ScaleBar', () => {
  it('positions the index mark at the measured distance', () => {
    const wrapper = mount(ScaleBar, { props: { cm360: 22.5 } })
    expect(wrapper.find('[data-test="index"]').attributes('style')).toContain('50%')
  })

  it('draws every centimetre tick', () => {
    const wrapper = mount(ScaleBar, { props: { cm360: 30 } })
    expect(wrapper.findAll('[data-test="tick"]')).toHaveLength(46)
  })

  it('reports how many pad widths a long turn needs', () => {
    const wrapper = mount(ScaleBar, { props: { cm360: 90 } })
    expect(wrapper.find('[data-test="overflow"]').text()).toContain('2')
  })

  it('hides the overflow note when the turn fits', () => {
    const wrapper = mount(ScaleBar, { props: { cm360: 30 } })
    expect(wrapper.find('[data-test="overflow"]').exists()).toBe(false)
  })

  it('states the measured distance for assistive technology', () => {
    const wrapper = mount(ScaleBar, { props: { cm360: 30 } })
    expect(wrapper.attributes('aria-label')).toContain('30')
  })
})
