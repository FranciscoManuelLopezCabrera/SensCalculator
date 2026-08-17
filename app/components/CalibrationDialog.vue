<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSettingsStore } from '~/stores/settings'
import { yawFromMeasurement } from '~~/lib/math/calibrate'

const store = useSettingsStore()

const sens = ref<number | null>(null)
const measuredCm = ref<number | null>(null)
const turns = ref(1)

const yaw = computed(() => {
  if (!sens.value || !measuredCm.value) return null
  try {
    return yawFromMeasurement({
      dpi: store.dpi,
      sens: sens.value,
      measuredCm: measuredCm.value,
      turns: turns.value
    })
  } catch {
    return null
  }
})

function save() {
  if (yaw.value === null) return
  store.saveCalibration(store.gameSlug, yaw.value)
}
</script>

<template>
  <section class="panel grid gap-3 p-5">
    <p class="eyebrow">Medición</p>
    <h2 class="text-md font-semibold">Calibrar {{ store.game.name }}</h2>

    <ol class="data grid gap-1 text-xs text-ink-2">
      <li>1. Deja el DPI en {{ store.dpi }}, Windows en 6/11 y sin aceleración.</li>
      <li>2. Pon en el juego la sensibilidad que vayas a indicar aquí.</li>
      <li>3. Marca un punto de referencia en pantalla y otro en la alfombrilla.</li>
      <li>4. Gira las vueltas indicadas y mide los centímetros recorridos.</li>
    </ol>

    <label class="text-xs text-ink-2" for="cal-sens">Sensibilidad usada</label>
    <input
      id="cal-sens"
      data-test="cal-sens"
      type="number"
      step="any"
      class="field"
      @input="sens = Number(($event.target as HTMLInputElement).value)"
    >

    <label class="text-xs text-ink-2" for="cal-cm">Distancia total medida en cm</label>
    <input
      id="cal-cm"
      data-test="cal-cm"
      type="number"
      step="any"
      class="field"
      @input="measuredCm = Number(($event.target as HTMLInputElement).value)"
    >

    <label class="text-xs text-ink-2" for="cal-turns">Vueltas completas</label>
    <input
      id="cal-turns"
      data-test="cal-turns"
      type="number"
      min="1"
      step="1"
      :value="turns"
      class="field"
      @input="turns = Number(($event.target as HTMLInputElement).value)"
    >

    <p data-test="cal-yaw" class="flex items-baseline justify-between border-b border-rule py-2">
      <span class="eyebrow">Yaw calculado</span>
      <span class="data text-sm">{{ yaw === null ? 'sin datos' : yaw.toFixed(6) }}</span>
    </p>

    <button
      data-test="cal-save"
      type="button"
      class="btn text-xs disabled:text-ink-2"
      :disabled="yaw === null"
      @click="save"
    >
      Guardar calibración
    </button>
  </section>
</template>
