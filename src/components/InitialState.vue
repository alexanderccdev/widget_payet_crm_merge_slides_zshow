<template>
  <div class="text-center p-8">
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
            :modelValue="documentName"
            @update:modelValue="handleInputChange"
            placeholder="Ej: presentacion_cliente_demo"
            class="w-full"
          />
        </div>
        
        <Button 
          label="Generar presentación" 
          icon="pi pi-play" 
          @click="$emit('generate')" 
          :disabled="!documentName || isLoading"
          class="w-full px-6 py-2" 
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

defineProps({
  documentName: {
    type: String,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:documentName', 'generate'])

const handleInputChange = (value) => {
  emit('update:documentName', value);
}
</script>
