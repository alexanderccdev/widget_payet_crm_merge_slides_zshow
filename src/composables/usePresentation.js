import { usePresentationStore } from '../stores/presentationStore.js';
import { ZohoApiService } from '../services/zohoApiService.js';

/**
 * Presentation Composable
 * Provides presentation-related functionality using the store
 */
export const usePresentation = () => {
  const store = usePresentationStore();

  const initZSDK = async () => {
    return new Promise((resolve) => {
      ZOHO.embeddedApp.on("PageLoad", async function (data) {
        try {
          ZOHO.CRM.UI.Resize({ height: 380, width: 600 });

          await store.initializeWithRecord(data.EntityId[0]);
          resolve(data);
        } catch (error) {
          store.setErrorMessage(error.message);
        }
      });

      ZOHO.embeddedApp.init();
    });
  };

  return {
    // State from store
    isLoading: store.isLoading,
    statusMessage: store.statusMessage,
    errorMessage: store.errorMessage,
    successMessage: store.successMessage,
    progressValue: store.progressValue,
    documentName: store.documentName,
    result: store.result,
    
    // Computed from store
    isCompleted: store.isCompleted,
    hasError: store.hasError,
    isProcessing: store.isProcessing,
    
    // Actions from store
    setDocumentName: store.setDocumentName,
    processPresentation: store.processPresentation,
    retry: store.retry,
    retryWithReload: store.retryWithReload,
    close: store.close,
    initZSDK
  };
};
