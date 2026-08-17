<script setup lang="ts">
import { computed } from 'vue'
import { GAMES } from '~~/lib/games'
import type { Confidence } from '~~/lib/types'

defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const groups: { tier: Confidence; label: string }[] = [
  { tier: 'A', label: 'Datos verificados' },
  { tier: 'B', label: 'Sin confirmar' },
  { tier: 'C', label: 'Requieren calibración' }
]

const byTier = computed(() =>
  groups.map(group => ({
    ...group,
    games: GAMES.filter(game => game.confidence === group.tier)
  }))
)

function onChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>

<template>
  <select :value="modelValue" aria-label="Juego" class="field text-sm" @change="onChange">
    <optgroup v-for="group in byTier" :key="group.tier" :label="group.label">
      <option v-for="game in group.games" :key="game.slug" :value="game.slug">
        {{ game.name }}
      </option>
    </optgroup>
  </select>
</template>
