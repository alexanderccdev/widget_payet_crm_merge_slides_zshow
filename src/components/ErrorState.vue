<template>
  <div class="text-center p-8">
    <div class="flex flex-col items-center space-y-4">
      <i class="pi pi-exclamation-triangle text-red-500 text-4xl"></i>
      <div class="text-center">
        <h3 class="text-lg font-semibold text-red-600 mb-2">
          No se pudo completar la generación
        </h3>
        <p class="text-red-500 text-sm mb-4">{{ errorMessage }}</p>
      </div>
      <Button 
        label="Volver a intentar" 
        icon="pi pi-refresh" 
        severity="secondary" 
        @click="$emit('retry')" 
        class="px-6 py-2" 
      />
    </div>
  </div>
</template>

<script setup>
import Button from 'primevue/button'

defineProps({
  errorMessage: {
    type: String,
    required: true
  }
})

defineEmits(['retry'])
</script>
