/**
 * Merge API Service
 * Handles all merge process API interactions
 */
export class MergeApiService {
  /**
   * Get process route based on module
   * @param {string} module - The module name
   * @returns {string} The route
   */
  static getProcessRoute(module) {
    const routes = {
      'Accounts': 'cliente',
      'Institucionales': 'institucional',
      'Estudios': 'estudios'
    };

    return routes[module] || 'cliente';
  }

  /**
   * Generate document name from record
   * @param {Object} record - The event record
   * @returns {string} The document name
   */
  static generateDocumentName(record) {
    const eventTitle = record.What_Id?.name || '';
    const eventName = record.Nombre_del_Evento || '';
    return `${eventName} - ${eventTitle}`.trim();
  }

  /**
   * Start merge process
   * @param {string} entityId - The entity ID
   * @param {Object} mergeData - The merge data
   * @param {string} documentName - The document name
   * @returns {Promise<Object>} The merge response
   */
  static async mergeProcess(entityId, mergeData, documentName) {
    try {
      const response = await fetch(
        `https://solucionesm4g.site:8443/payet-merge-slides/api/merge/process/${this.getProcessRoute(mergeData.module)}?importFileName=${documentName}`,
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

  /**
   * Get process status
   * @param {string} processID - The process ID
   * @returns {Promise<Object>} The status response
   */
  static async getStatusProcess(processID) {
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

  /**
   * Wait for process completion
   * @param {string} processID - The process ID
   * @param {number} maxAttempts - Maximum attempts
   * @param {number} delay - Delay between attempts
   * @returns {Promise<Object>} The completion result
   */
  static async waitForProcessCompletion(processID, maxAttempts = 30, delay = 2000) {
    let attempts = 0;

    const checkStatus = async () => {
      attempts++;

      const statusResponse = await this.getStatusProcess(processID);
      const status = statusResponse;

      if (status.status === 'COMPLETED') {
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
  }
}
