<script setup lang="ts">
import { computed } from 'vue'
import type { Confidence } from '~~/lib/types'

const props = defineProps<{ confidence: Confidence; note?: string }>()

const label = computed(() => {
  if (props.confidence === 'A') return 'Verificado'
  if (props.confidence === 'B') return 'Sin confirmar'
  return 'Requiere calibración'
})

const tone = computed(() => (props.confidence === 'C' ? 'text-index' : 'text-ink-2'))
</script>

<template>
  <span :title="note" :class="['inline-flex items-baseline gap-2 text-2xs', tone]">
    <span class="data border border-current px-1 leading-none">{{ confidence }}</span>
    <span class="eyebrow" :class="tone">{{ label }}</span>
  </span>
</template>
