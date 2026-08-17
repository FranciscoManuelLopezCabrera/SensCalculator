import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import CalibrationDialog from '~/components/CalibrationDialog.vue'
import { useSettingsStore } from '~/stores/settings'

describe('CalibrationDialog', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('derives the yaw from the measurement', async () => {
    const wrapper = mount(CalibrationDialog)
    await wrapper.find('[data-test="cal-sens"]').setValue('1')
    await wrapper.find('[data-test="cal-cm"]').setValue('51.9545')
    expect(wrapper.find('[data-test="cal-yaw"]').text()).toContain('0.022')
  })

  it('divides by the number of turns', async () => {
    const wrapper = mount(CalibrationDialog)
    await wrapper.find('[data-test="cal-sens"]').setValue('1')
    await wrapper.find('[data-test="cal-cm"]').setValue('519.545')
    await wrapper.find('[data-test="cal-turns"]').setValue('10')
    expect(wrapper.find('[data-test="cal-yaw"]').text()).toContain('0.022')
  })

  it('saves the calibration into the store', async () => {
    const store = useSettingsStore()
    store.setGame('pubg')
    const wrapper = mount(CalibrationDialog)
    await wrapper.find('[data-test="cal-sens"]').setValue('50')
    await wrapper.find('[data-test="cal-cm"]').setValue('30')
    await wrapper.find('[data-test="cal-save"]').trigger('click')
    expect(store.calibrations.pubg).toBeGreaterThan(0)
    expect(store.error).toBeNull()
  })

  it('does not save an incomplete measurement', async () => {
    const store = useSettingsStore()
    const wrapper = mount(CalibrationDialog)
    await wrapper.find('[data-test="cal-save"]').trigger('click')
    expect(Object.keys(store.calibrations)).toHaveLength(0)
  })
})
