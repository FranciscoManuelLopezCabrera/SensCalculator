import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ConverterPanel from '~/components/ConverterPanel.vue'
import { useSettingsStore } from '~/stores/settings'
import { tierAGames } from '~~/lib/games'

describe('ConverterPanel', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('lists every tier A game except the current one', () => {
    const wrapper = mount(ConverterPanel)
    expect(wrapper.findAll('[data-test^="row-"]')).toHaveLength(tierAGames().length - 1)
    expect(wrapper.find('[data-test="row-cs2"]').exists()).toBe(false)
  })

  it('converts cs2 sens 1 into valorant 0.314', () => {
    const store = useSettingsStore()
    store.setSens(1)
    const wrapper = mount(ConverterPanel)
    expect(wrapper.find('[data-test="row-valorant"]').text()).toContain('0.314')
  })

  it('converts cs2 sens 1 into overwatch 3', () => {
    const store = useSettingsStore()
    store.setSens(1)
    const wrapper = mount(ConverterPanel)
    expect(wrapper.find('[data-test="row-overwatch-2"]').text()).toContain('3')
  })

  it('renders nothing when the current game has no usable yaw', () => {
    const store = useSettingsStore()
    store.setGame('pubg')
    const wrapper = mount(ConverterPanel)
    expect(wrapper.findAll('[data-test^="row-"]')).toHaveLength(0)
  })
})
