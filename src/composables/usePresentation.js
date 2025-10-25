import { usePresentationStore } from '../stores/presentationStore.js';

/**
 * Presentation Composable
 * Provides Zoho SDK initialization functionality
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
    initZSDK
  };
};
