<script setup lang="ts">
import { computed } from 'vue'
import type { SensSummary } from '~~/lib/index'
import { formatSens } from '~~/lib/math/quantize'
import ConfidenceMark from '~/components/ConfidenceMark.vue'
import ScaleBar from '~/components/ScaleBar.vue'

const props = defineProps<{ summary: SensSummary | null; error: string | null }>()

const showQuantizeWarning = computed(() => (props.summary?.sensQuantized.errorPct ?? 0) > 0.5)

const verdictLabel: Record<string, string> = {
  'muy-rapida': 'Muy rápida',
  rapida: 'Rápida',
  media: 'Media',
  lenta: 'Lenta'
}

function round(value: number, digits: number): string {
  return value.toFixed(digits)
}

const rows = computed(() => {
  const s = props.summary
  if (!s) return []

  return [
    { key: 'cm360', label: 'cm por giro', value: `${round(s.cm360, 2)} cm` },
    { key: 'in360', label: 'pulgadas por giro', value: `${round(s.in360, 2)} in` },
    { key: 'edpi', label: 'eDPI', value: round(s.edpi, 0) },
    { key: 'normalized', label: 'eDPI equivalente en CS2', value: round(s.normalizedEdpi, 0) },
    { key: 'sens-exact', label: 'Sensibilidad exacta', value: round(s.sens, 6) },
    {
      key: 'sens-usable',
      label: 'Valor a escribir en el juego',
      value: formatSens(s.sensQuantized.value, s.game.input)
    },
    { key: 'counts', label: 'Cuentas por giro', value: round(s.countsPer360, 0) },
    { key: 'speed', label: 'Velocidad', value: verdictLabel[s.verdict] },
    {
      key: 'yaw',
      label: s.yawSource === 'calibrated' ? 'Yaw calibrado por ti' : 'Yaw publicado',
      value: String(s.yaw)
    }
  ]
})
</script>

<template>
  <section class="panel grid content-start gap-6 p-5 min-h-[32rem]">
    <p v-if="error" data-test="error" class="text-sm text-index">
      <span class="eyebrow block text-index">Sin resultado</span>
      {{ error }}
    </p>

    <template v-else-if="summary">
      <header class="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule pb-2">
        <h2 class="text-md font-semibold">{{ summary.game.name }}</h2>
        <ConfidenceMark :confidence="summary.game.confidence" :note="summary.game.confidenceNote" />
      </header>

      <ScaleBar :cm360="summary.cm360" />

      <dl class="grid">
        <div
          v-for="row in rows"
          :key="row.key"
          :data-test="row.key"
          class="flex items-baseline justify-between gap-4 border-b border-rule py-2"
        >
          <dt class="eyebrow">{{ row.label }}</dt>
          <dd class="data text-sm">{{ row.value }}</dd>
        </div>
      </dl>

      <p v-if="showQuantizeWarning" data-test="quantize-warning" class="text-xs">
        <span class="eyebrow block text-index">Valor no introducible</span>
        {{ summary.game.name }} no admite el valor exacto. El más cercano que sí acepta se desvía un
        {{ round(summary.sensQuantized.errorPct, 2) }} % de tu objetivo.
      </p>

      <p v-if="summary.game.proEdpi" data-test="pro-range" class="text-xs text-ink-2">
        <span class="eyebrow block">Referencia</span>
        Los profesionales se mueven entre {{ summary.game.proEdpi.low }} y
        {{ summary.game.proEdpi.high }} eDPI. El valor más habitual es {{ summary.game.proEdpi.typical }}.
      </p>
    </template>
  </section>
</template>
