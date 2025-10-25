import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ZohoApiService } from '../services/zohoApiService.js';
import { MergeApiService } from '../services/mergeApiService.js';

export const usePresentationStore = defineStore('presentation', () => {
  // State
  const isLoading = ref(false);
  const statusMessage = ref('');
  const errorMessage = ref('');
  const successMessage = ref('');
  const progressValue = ref(0);
  const documentName = ref('');
  const entityID = ref(null);
  const processId = ref(null);
  const result = ref(null);

  // Getters
  const isCompleted = computed(() => successMessage.value !== '');
  const hasError = computed(() => errorMessage.value !== '');
  const isProcessing = computed(() => isLoading.value && !hasError.value);

  // Actions
  const setEntityID = (id) => {
    entityID.value = id;
  };

  const setDocumentName = (name) => {
    documentName.value = name;
  };

  const setLoading = (loading) => {
    isLoading.value = loading;
  };

  const setStatusMessage = (message) => {
    statusMessage.value = message;
  };

  const setErrorMessage = (message) => {
    errorMessage.value = message;
  };

  const setSuccessMessage = (message) => {
    successMessage.value = message;
  };

  const setProgress = (progress) => {
    progressValue.value = progress;
  };

  const setResult = (data) => {
    result.value = data;
  };

  const reset = () => {
    isLoading.value = false;
    statusMessage.value = '';
    errorMessage.value = '';
    successMessage.value = '';
    progressValue.value = 0;
    result.value = null;
  };

  const processPresentation = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      setProgress(0);

      setStatusMessage("Obteniendo datos del registro...");
      setProgress(5);

      const dataPayload = await ZohoApiService.buildDataPayload(entityID.value);

      setStatusMessage("Iniciando generación de presentación...");
      setProgress(15);

      const mergeResponse = await MergeApiService.mergeProcess(
        entityID.value, 
        dataPayload.data, 
        documentName.value
      );

      processId.value = mergeResponse.processId;

      setStatusMessage("Generando presentación...");
      setProgress(25);

      // Monitorear progreso
      const completionResult = await MergeApiService.waitForProcessCompletion(processId.value);

      if (completionResult.status === 'completed') {
        setStatusMessage("Actualizando registro...");
        setProgress(95);

        // Actualizar record en CRM si hay permalink
        if (completionResult.data.permaLink) {
          try {
            await ZohoApiService.updateEventRecord(completionResult.data.permaLink, entityID.value);
          } catch (updateError) {
            console.warn("Error actualizando record, pero presentación generada exitosamente:", updateError);
          }
        }

        setProgress(100);
        setSuccessMessage(`Presentación "${completionResult.data.fileName}" generada exitosamente`);
        setResult(completionResult.data);

        return completionResult.data;
      }

    } catch (error) {
      console.error("Error en la generación:", error);
      setErrorMessage(error.message || "Ocurrió un error inesperado");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const initializeWithRecord = async (entityId) => {
    try {
      const record = await ZohoApiService.getEventRecord(entityId);
      const autoDocumentName = MergeApiService.generateDocumentName(record);
      setDocumentName(autoDocumentName);
      setEntityID(entityId);
    } catch (error) {
      setErrorMessage(error.message);
      throw error;
    }
  };

  const retry = () => {
    reset();
  };

  const retryWithReload = () => {
    location.reload();
  };

  const close = async () => {
    await ZohoApiService.closePopup();
  };

  return {
    // State
    isLoading,
    statusMessage,
    errorMessage,
    successMessage,
    progressValue,
    documentName,
    entityID,
    processId,
    result,
    
    // Getters
    isCompleted,
    hasError,
    isProcessing,
    
    // Actions
    setEntityID,
    setDocumentName,
    setLoading,
    setStatusMessage,
    setErrorMessage,
    setSuccessMessage,
    setProgress,
    setResult,
    reset,
    processPresentation,
    initializeWithRecord,
    retry,
    retryWithReload,
    close
  };
});
