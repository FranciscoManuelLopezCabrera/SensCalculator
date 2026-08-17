import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import EdpiCalculator from '~/components/EdpiCalculator.vue'
import { useSettingsStore } from '~/stores/settings'

function mountCalculator() {
  return mount(EdpiCalculator)
}

describe('EdpiCalculator', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('computes edpi from sens', async () => {
    const wrapper = mountCalculator()
    await wrapper.find('[data-test="sens"]').setValue('2')
    expect(useSettingsStore().edpi).toBeCloseTo(1600, 6)
  })

  it('computes sens from edpi', async () => {
    const wrapper = mountCalculator()
    await wrapper.find('[data-test="mode-edpi"]').trigger('click')
    await wrapper.find('[data-test="edpi"]').setValue('400')
    expect(useSettingsStore().sens).toBeCloseTo(0.5, 6)
  })

  it('marks the derived field as readonly', async () => {
    const wrapper = mountCalculator()
    expect(wrapper.find('[data-test="edpi"]').attributes('readonly')).toBeDefined()
    await wrapper.find('[data-test="mode-edpi"]').trigger('click')
    expect(wrapper.find('[data-test="sens"]').attributes('readonly')).toBeDefined()
  })

  it('updates the store when the dpi changes', async () => {
    const wrapper = mountCalculator()
    await wrapper.find('[data-test="dpi"]').setValue('1600')
    expect(useSettingsStore().dpi).toBe(1600)
  })

  it('ignores non-positive input', async () => {
    const wrapper = mountCalculator()
    await wrapper.find('[data-test="sens"]').setValue('0')
    expect(useSettingsStore().sens).toBe(1)
  })
})
