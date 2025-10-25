<template>
  <!-- Loading State -->
  <LoadingState v-if="store.isLoading" :status-message="store.statusMessage" :progress-value="store.progressValue" />

  <!-- Error State -->
  <ErrorState v-else-if="store.hasError" :error-message="store.errorMessage" @retry="store.retry" />

  <!-- Success State -->
  <SuccessState v-else-if="store.isCompleted" :success-message="store.successMessage" :result="store.result"
    @open-presentation="openPresentation" @close="store.close" />

  <!-- Initial State -->
  <InitialState v-else :document-name="store.documentName" :is-loading="store.isLoading"
    @update:document-name="handleDocumentNameUpdate" @generate="handleGeneratePresentation" />
</template>

<script setup>
import { onMounted } from 'vue'
import { usePresentationStore } from '../stores/presentationStore.js'
import { usePresentation } from '../composables/usePresentation.js'
import LoadingState from '../components/LoadingState.vue'
import ErrorState from '../components/ErrorState.vue'
import SuccessState from '../components/SuccessState.vue'
import InitialState from '../components/InitialState.vue'

const store = usePresentationStore()
const { initZSDK } = usePresentation()

const handleGeneratePresentation = async () => {
  try {
    await store.processPresentation()
  } catch (err) {
    console.error('Error generating presentation:', err)
  }
}

const handleDocumentNameUpdate = (value) => {
  console.log('PresentationPage received update:', value);
  store.setDocumentName(value);
}

const openPresentation = () => {
  if (store.result?.permaLink) {
    window.open(store.result.permaLink, '_blank')
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