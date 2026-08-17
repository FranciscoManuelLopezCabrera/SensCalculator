<script setup lang="ts">
const items = [
  { label: 'Puntero de Windows', value: 'En 6/11, que es el multiplicador 1.0.' },
  { label: 'Precisión del puntero', value: 'Desactivada. Es aceleración.' },
  { label: 'Aceleración del juego', value: 'Desactivada.' },
  { label: 'Raw input', value: 'Activado.' },
  { label: 'DPI real', value: 'Puede desviarse entre un 1 y un 5 % del nominal.' },
  { label: 'Tasa de sondeo', value: 'No cambia el recorrido por giro. No la toques por esto.' }
]
</script>

<template>
  <section class="panel grid gap-2 p-5">
    <p class="eyebrow">Condiciones</p>
    <h2 class="text-md font-semibold">Antes de fiarte del resultado</h2>
    <dl class="grid">
      <div
        v-for="item in items"
        :key="item.label"
        class="flex items-baseline justify-between gap-4 border-b border-rule py-2"
      >
        <dt class="eyebrow">{{ item.label }}</dt>
        <dd class="text-xs text-ink-2">{{ item.value }}</dd>
      </div>
    </dl>
  </section>
</template>
