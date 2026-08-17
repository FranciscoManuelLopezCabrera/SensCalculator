<script setup lang="ts">
import { onMounted } from 'vue'
import { useSettingsStore } from '~/stores/settings'
import { useUrlState } from '~/composables/useUrlState'
import EdpiCalculator from '~/components/EdpiCalculator.vue'
import ResultCard from '~/components/ResultCard.vue'
import ConverterPanel from '~/components/ConverterPanel.vue'
import CalibrationDialog from '~/components/CalibrationDialog.vue'
import SystemChecklist from '~/components/SystemChecklist.vue'

const store = useSettingsStore()

onMounted(() => {
  store.hydrate()
})

useUrlState()

useHead({
  title: 'Calculadora de eDPI y sensibilidad para juegos de PC',
  meta: [
    {
      name: 'description',
      content:
        'Calcula tu eDPI a partir de la sensibilidad, o la sensibilidad que necesitas para un eDPI objetivo, en CS2, Valorant, Apex, Overwatch 2, Fortnite y más.'
    }
  ]
})
</script>

<template>
  <main class="mx-auto grid max-w-5xl gap-8 px-4 py-10">
    <header class="grid gap-2 border-b border-ink pb-4">
      <p class="eyebrow">Instrumento de medida</p>
      <h1 class="text-lg">Calculadora de eDPI y sensibilidad</h1>
      <p class="max-w-prose text-xs text-ink-2">
        Elige tu juego y calcula en las dos direcciones: de sensibilidad a eDPI y de eDPI a
        sensibilidad. Cada juego indica cuánta confianza merece su constante.
      </p>
    </header>

    <div class="grid gap-8 lg:grid-cols-2">
      <EdpiCalculator />
      <ResultCard :summary="store.summary" :error="store.error" />
    </div>

    <ConverterPanel />

    <div class="grid gap-8 lg:grid-cols-2">
      <SystemChecklist />
      <CalibrationDialog />
    </div>
  </main>
</template>
