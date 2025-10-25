import { ref } from 'vue';

export const useZohoSDK = () => {
  const isLoading = ref(false);
  const statusMessage = ref('');
  const errorMessage = ref('');
  const successMessage = ref('');
  const progressValue = ref(0);
  const documentName = ref('');

  let entityID = null;
  let processId = null;

  const buildDataPayload = async (entityID) => {
    try {
      var request = {
        url: "https://www.zohoapis.com/crm/v2/functions/mergeslidesdocuments__build_merge_data/actions/execute?auth_type=apikey&zapikey=1003.42a30c3de88372443229f64028aee7bd.fabb73f15b2d10ae3ee3cb3af3bf0c1d&record_id=" + entityID,
        headers: {}
      }

      const response = await ZOHO.CRM.HTTP.get(request);
      return JSON.parse(response);
    } catch (error) {
      console.error("Error building data payload:", error);
      throw error;
    }
  }

  const getEventRecord = async (entityId) => {
    try {
      const response = await ZOHO.CRM.API.getRecord({
        Entity: "Events",
        RecordID: entityId
      });
      return response.data[0];
    } catch (error) {
      console.error("Error al obtener el registro del evento:", error);
      throw error;
    }
  }

  const getProcessRoute = (module) => {
    const routes = {
      'Accounts': 'cliente',
      'Institucionales': 'institucional',
      'Estudios': 'estudios'
    };

    return routes[module] || 'cliente';
  }

  const generateDocumentName = (record) => {
    const eventTitle = record.Event_Title || '';
    const eventName = record.Nombre_del_Evento || '';
    return `${eventName} - ${eventTitle}`.trim();
  }

  const mergeProcess = async (entityId, mergeData) => {
    try {
      const record = await getEventRecord(entityId);
      const autoDocumentName = documentName.value || generateDocumentName(record);
      const module = record.$se_module;
      const route = getProcessRoute(module);

      console.log(`Procesando: ${module} -> ${route}, Documento: ${autoDocumentName}`);

      const response = await fetch(
        `https://solucionesm4g.site:8443/payet-merge-slides/api/merge/process/${route}?importFileName=${autoDocumentName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(mergeData)
        }
      );

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Error in mergeProcess:', error);
      throw error;
    }
  }

  const getStatusProcess = async (processID) => {
    try {
      const response = await fetch(
        `https://solucionesm4g.site:8443/payet-merge-slides/api/merge/status/${processID}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Error in getStatusProcess:', error);
      throw error;
    }
  }

  const updateEventRecord = async (permaLink, entityID) => {
    try {
      var config = {
        Entity: "Events",
        APIData: {
          "id": entityID,
          "URL_de_Presentacion": permaLink
        },
        Trigger: ["workflow"]
      }
      await ZOHO.CRM.API.updateRecord(config)
    } catch (error) {
      console.error("Error updating record:", error);
      throw error;
    }
  }

  const waitForProcessCompletion = async (processID, maxAttempts = 30, delay = 2000) => {
    let attempts = 0;

    const checkStatus = async () => {
      attempts++;
      console.log(`Verificando proceso, intento ${attempts}...`);

      const statusResponse = await getStatusProcess(processID);
      const status = statusResponse;

      // Actualizar progreso basado en el status
      if (status.progress) {
        progressValue.value = status.progress;
      }

      if (status.status === 'COMPLETED') {
        console.log("Proceso completado");
        progressValue.value = 100;
        return {
          status: 'completed',
          data: {
            permaLink: status.permaLink,
            fileName: status.fileName,
            processId: status.processId
          }
        };
      } else if (status.status === 'ERROR') {
        throw new Error(status.errorMessage || "Error durante el procesamiento");
      } else if (attempts < maxAttempts && status.status === 'PROCESSING') {
        statusMessage.value = `Procesando presentación... (${attempts}/${maxAttempts})`;

        return new Promise(resolve => {
          setTimeout(async () => {
            resolve(await checkStatus());
          }, delay);
        });
      } else {
        throw new Error("El procesamiento tomó demasiado tiempo. Por favor, intenta de nuevo.");
      }
    };

    return await checkStatus();
  };

  const processPresentation = async () => {
    try {
      isLoading.value = true;
      errorMessage.value = '';
      successMessage.value = '';
      progressValue.value = 0;

      statusMessage.value = "Obteniendo datos del registro...";
      progressValue.value = 5;

      const dataPayload = await buildDataPayload(entityID);

      statusMessage.value = "Iniciando generación de presentación...";
      progressValue.value = 15;

      const mergeResponse = await mergeProcess(entityID, dataPayload.data);

      processId = mergeResponse.processId;

      statusMessage.value = "Generando presentación...";
      progressValue.value = 25;

      // Monitorear progreso
      const result = await waitForProcessCompletion(processId);

      if (result.status === 'completed') {
        statusMessage.value = "Actualizando registro...";
        progressValue.value = 95;

        // Actualizar record en CRM si hay permalink
        if (result.data.permaLink) {
          try {
            await updateEventRecord(result.data.permaLink, entityID);
          } catch (updateError) {
            console.warn("Error actualizando record, pero presentación generada exitosamente:", updateError);
          }
        }

        progressValue.value = 100;
        successMessage.value = `Presentación "${result.data.fileName}" generada exitosamente`;

        return result.data;
      }

    } catch (error) {
      console.error("Error en la generación:", error);
      errorMessage.value = error.message || "Ocurrió un error inesperado";
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const retry = () => {
    location.reload();
  };

  const close = async () => {
    await ZOHO.CRM.UI.Popup.closeReload();
  };

  const initZSDK = () => {
    return new Promise((resolve) => {
      ZOHO.embeddedApp.on("PageLoad", async function (data) {
        try {
          ZOHO.CRM.UI.Resize({ height: 380, width: 600 });

          entityID = data.EntityId[0];

          // Generar nombre del documento automáticamente
          const record = await getEventRecord(entityID);
          documentName.value = generateDocumentName(record);

          resolve(data);
        } catch (error) {
          errorMessage.value = error.message;
        }
      });

      ZOHO.embeddedApp.init();
    });
  };

  return {
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
  };
};