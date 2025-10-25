<template>
  <!-- Loading State -->
  <div v-if="isLoading" class="text-center p-8">
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

  <!-- Error State -->
  <div v-else-if="errorMessage" class="text-center p-8">
    <div class="flex flex-col items-center space-y-4">
      <i class="pi pi-exclamation-triangle text-red-500 text-4xl"></i>
      <div class="text-center">
        <h3 class="text-lg font-semibold text-red-600 mb-2">
          No se pudo completar la generación
        </h3>
        <p class="text-red-500 text-sm mb-4">{{ errorMessage }}</p>
      </div>
      <Button label="Volver a intentar" icon="pi pi-refresh" severity="secondary" @click="retry" class="px-6 py-2" />
    </div>
  </div>

  <!-- Success State -->
  <div v-else-if="successMessage" class="text-center p-8">
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
          @click="openPresentation" 
          class="px-6 py-2" 
        />
        <Button label="Cerrar" icon="pi pi-times" severity="success" @click="close" class="px-6 py-2" />
      </div>
    </div>
  </div>

  <!-- Initial State -->
  <div v-else class="text-center p-8">
    <div class="flex flex-col items-center space-y-4">
      <i class="pi pi-file text-gray-400 text-4xl"></i>
      <div class="text-center">
        <h3 class="text-lg font-semibold text-gray-600 mb-2">
          Generador de Presentaciones
        </h3>
        <p class="text-gray-500 text-sm mb-4">
          Sistema de generación de presentaciones listo para usar
        </p>
      </div>
      
      <div class="w-full max-w-sm space-y-3">
        <div>
          <label for="documentName" class="block text-sm font-medium text-gray-700 mb-1">
            Nombre del documento
          </label>
          <InputText
            id="documentName"
            v-model="documentName"
            placeholder="Ej: presentacion_cliente_demo"
            class="w-full"
          />
        </div>
        
        <Button 
          label="Generar presentación" 
          icon="pi pi-play" 
          @click="handleGeneratePresentation" 
          :disabled="!documentName || isLoading"
          class="w-full px-6 py-2" 
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useZohoSDK } from '../composables/zohoSDK.js'
import Button from 'primevue/button'
import ProgressBar from 'primevue/progressbar'
import InputText from 'primevue/inputtext'

const {
  isLoading,
  statusMessage,
  errorMessage,
  successMessage,
  progressValue,
  documentName,
  processPresentation,
  retry,
  close,
  initZSDK
} = useZohoSDK()

const result = ref(null)

const handleGeneratePresentation = async () => {
  try {
    result.value = await processPresentation()
  } catch (err) {
    console.error('Error generating presentation:', err)
  }
}

const openPresentation = () => {
  if (result.value?.permaLink) {
    window.open(result.value.permaLink, '_blank')
  }
}

onMounted(() => {
  initZSDK()
})
</script>

<style scoped>
.pi {
  font-size: inherit;
}
</style>