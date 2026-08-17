<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '~/stores/settings'
import { formatSens } from '~~/lib/math/quantize'
import GameSelect from '~/components/GameSelect.vue'

const store = useSettingsStore()

const isSensMode = computed(() => store.mode === 'sens-to-edpi')
const sensLabel = computed(() => (store.game.scaleLabel === '%' ? 'Sensibilidad (%)' : 'Sensibilidad'))
const sensDisplay = computed(() => (isSensMode.value ? String(store.sens) : formatSens(store.sens, store.game.input)))

function readNumber(event: Event): number {
  return Number((event.target as HTMLInputElement).value)
}
</script>

<template>
  <section class="panel grid gap-4 p-5">
    <p class="eyebrow">Entrada</p>

    <div class="grid gap-2">
      <label class="text-xs text-ink-2" for="game">Juego</label>
      <GameSelect id="game" :model-value="store.gameSlug" @update:model-value="store.setGame" />
    </div>

    <div class="grid gap-2">
      <label class="text-xs text-ink-2" for="dpi">DPI del ratón</label>
      <input
        id="dpi"
        data-test="dpi"
        type="number"
        min="1"
        step="1"
        :value="store.dpi"
        class="field"
        @input="store.setDpi(readNumber($event))"
      >
    </div>

    <div class="grid grid-cols-2" role="group" aria-label="Modo de cálculo">
      <button
        data-test="mode-sens"
        type="button"
        class="btn border-r-0 text-xs"
        :aria-pressed="isSensMode"
        @click="store.setMode('sens-to-edpi')"
      >
        Sensibilidad a eDPI
      </button>
      <button
        data-test="mode-edpi"
        type="button"
        class="btn text-xs"
        :aria-pressed="!isSensMode"
        @click="store.setMode('edpi-to-sens')"
      >
        eDPI a sensibilidad
      </button>
    </div>

    <div class="grid gap-2">
      <label class="text-xs text-ink-2" for="sens">{{ sensLabel }}</label>
      <input
        id="sens"
        data-test="sens"
        type="number"
        :min="store.game.input.min"
        :max="store.game.input.max"
        :step="store.game.input.step || 'any'"
        :readonly="!isSensMode"
        :value="sensDisplay"
        class="field"
        @input="store.setSens(readNumber($event))"
      >
    </div>

    <div class="grid gap-2">
      <label class="text-xs text-ink-2" for="edpi">eDPI</label>
      <input
        id="edpi"
        data-test="edpi"
        type="number"
        min="1"
        step="any"
        :readonly="isSensMode"
        :value="Number(store.edpi.toFixed(2))"
        class="field"
        @input="store.setEdpi(readNumber($event))"
      >
    </div>
  </section>
</template>
