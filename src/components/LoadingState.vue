<template>
  <div class="text-center p-8">
    <div class="flex flex-col items-center space-y-4">
      <div class="flex flex-col items-center space-y-2">
        <h3 class="text-lg font-semibold text-gray-700">
          Generando presentación
        </h3>
        <p class="text-sm text-gray-500">{{ statusMessage || 'Procesando información...' }}</p>
      </div>

      <div class="w-full max-w-md">
        <ProgressBar :value="progressValue" :showValue="false" class="h-2" />
        <p class="text-xs text-gray-400 mt-1 text-center">
          {{ Math.round(progressValue) }}% completado
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import ProgressBar from 'primevue/progressbar'

defineProps({
  statusMessage: {
    type: String,
    default: ''
  },
  progressValue: {
    type: Number,
    default: 0
  }
})
</script>
