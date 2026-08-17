<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '~/stores/settings'
import { tierAGames } from '~~/lib/games'
import { convertSens } from '~~/lib/math/convert'
import { quantizeSens, formatSens } from '~~/lib/math/quantize'

const store = useSettingsStore()

const rows = computed(() => {
  const summary = store.summary
  if (!summary) return []

  return tierAGames()
    .filter(game => game.slug !== summary.game.slug && game.yaw !== null)
    .map(game => {
      const exact = convertSens({
        sens: summary.sens,
        fromYaw: summary.yaw,
        toYaw: game.yaw as number,
        fromDpi: store.dpi,
        toDpi: store.dpi
      })
      const quantized = quantizeSens(exact, game.input)

      return {
        slug: game.slug,
        name: game.name,
        scaleLabel: game.scaleLabel,
        exact,
        usable: formatSens(quantized.value, game.input),
        errorPct: quantized.errorPct
      }
    })
})
</script>

<template>
  <section class="panel grid gap-3 p-5">
    <p class="eyebrow">Equivalencias</p>
    <h2 class="text-md font-semibold">La misma sensibilidad en otros juegos</h2>
    <p class="text-xs text-ink-2">Mismo DPI ({{ store.dpi }}) y mismo recorrido por giro en todos.</p>

    <ul class="grid">
      <li
        v-for="row in rows"
        :key="row.slug"
        :data-test="`row-${row.slug}`"
        class="flex items-baseline justify-between gap-4 border-b border-rule py-2"
      >
        <span class="text-xs">{{ row.name }}</span>
        <span class="data text-right text-sm">
          {{ row.usable }}<span v-if="row.scaleLabel === '%'"> %</span>
          <span v-if="row.errorPct > 0.5" class="block text-2xs text-ink-2">
            exacto {{ row.exact.toFixed(4) }}
          </span>
        </span>
      </li>
    </ul>
  </section>
</template>
