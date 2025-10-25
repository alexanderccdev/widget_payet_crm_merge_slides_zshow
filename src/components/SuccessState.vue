<template>
  <div class="text-center p-8">
    <div class="flex flex-col items-center space-y-4">
      <i class="pi pi-check-circle text-green-500 text-4xl"></i>
      <div class="text-center">
        <h3 class="text-lg font-semibold text-green-600 mb-2">
          ¡Generación completada!
        </h3>
        <p class="text-green-500 text-sm mb-4">
          {{ successMessage }}
        </p>
      </div>
      <div class="flex gap-2">
        <Button 
          v-if="result?.permaLink" 
          label="Abrir presentación" 
          icon="pi pi-external-link" 
          @click="$emit('openPresentation')" 
          class="px-6 py-2" 
        />
        <Button 
          label="Cerrar" 
          icon="pi pi-times" 
          severity="success" 
          @click="$emit('close')" 
          class="px-6 py-2" 
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import Button from 'primevue/button'

defineProps({
  successMessage: {
    type: String,
    required: true
  },
  result: {
    type: Object,
    default: null
  }
})

defineEmits(['openPresentation', 'close'])
</script>
