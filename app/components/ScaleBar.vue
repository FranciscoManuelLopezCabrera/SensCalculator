<script setup lang="ts">
import { computed } from 'vue'
import { buildScale } from '~~/lib/scale'

const props = defineProps<{ cm360: number; padWidthCm?: number }>()

const scale = computed(() => buildScale(props.cm360, props.padWidthCm))
const label = computed(
  () => `Recorrido de ${scale.value.cm360.toFixed(1)} centímetros sobre una alfombrilla de ${scale.value.padWidthCm} centímetros`
)

function pct(cm: number): string {
  return `${(cm / scale.value.padWidthCm) * 100}%`
}
</script>

<template>
  <figure class="grid gap-3" role="img" :aria-label="label">
    <p class="eyebrow">Recorrido para un giro completo</p>

    <p class="display text-xl leading-none">
      {{ scale.cm360.toFixed(1) }}<span class="data text-md text-ink-2"> cm</span>
    </p>

    <div class="relative h-16 border-b border-ink">
      <span
        v-for="cm in scale.minorTicks"
        :key="`m${cm}`"
        data-test="tick"
        class="absolute bottom-0 w-px bg-rule"
        :style="{ left: pct(cm), height: '10px' }"
      />
      <template v-for="cm in scale.majorTicks" :key="`M${cm}`">
        <span
          data-test="tick"
          class="absolute bottom-0 w-px bg-ink"
          :style="{ left: pct(cm), height: '20px' }"
        />
        <span class="data absolute bottom-6 text-2xs text-ink-2" :style="{ left: pct(cm) }">{{ cm }}</span>
      </template>

      <span
        data-test="index"
        class="absolute bottom-0 h-16 w-0.5 bg-index"
        :style="{ left: `${scale.indexPct}%`, transition: 'left 180ms linear' }"
      />

      <span
        v-if="scale.overflows"
        class="pointer-events-none absolute inset-y-0 right-0 w-16"
        style="background: linear-gradient(to right, transparent, var(--color-paper))"
      />
    </div>

    <figcaption v-if="scale.overflows" data-test="overflow" class="text-xs text-index">
      Ese giro no cabe en una alfombrilla de {{ scale.padWidthCm }} cm. Necesitas
      {{ scale.padWidths.toFixed(2) }} anchos de alfombrilla, o levantar el ratón.
    </figcaption>
  </figure>
</template>
