import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GameSelect from '~/components/GameSelect.vue'
import { GAMES } from '~~/lib/games'

describe('GameSelect', () => {
  it('renders one option per game', () => {
    const wrapper = mount(GameSelect, { props: { modelValue: 'cs2' } })
    expect(wrapper.findAll('option')).toHaveLength(GAMES.length)
  })

  it('groups options by confidence tier', () => {
    const wrapper = mount(GameSelect, { props: { modelValue: 'cs2' } })
    expect(wrapper.findAll('optgroup')).toHaveLength(3)
  })

  it('emits the selected slug', async () => {
    const wrapper = mount(GameSelect, { props: { modelValue: 'cs2' } })
    await wrapper.find('select').setValue('valorant')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['valorant'])
  })

  it('reflects the current value', () => {
    const wrapper = mount(GameSelect, { props: { modelValue: 'valorant' } })
    expect((wrapper.find('select').element as HTMLSelectElement).value).toBe('valorant')
  })
})
