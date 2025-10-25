/**
 * Zoho CRM API Service
 * Handles all Zoho CRM API interactions
 */
export class ZohoApiService {
  /**
   * Build data payload for merge process
   * @param {string} entityID - The entity ID
   * @returns {Promise<Object>} The data payload
   */
  static async buildDataPayload(entityID) {
    try {
      const request = {
        url: `https://www.zohoapis.com/crm/v2/functions/mergeslidesdocuments__build_merge_data/actions/execute?auth_type=apikey&zapikey=1003.42a30c3de88372443229f64028aee7bd.fabb73f15b2d10ae3ee3cb3af3bf0c1d&record_id=${entityID}`,
        headers: {}
      };

      const response = await ZOHO.CRM.HTTP.get(request);
      return JSON.parse(response);
    } catch (error) {
      console.error("Error building data payload:", error);
      throw error;
    }
  }

  /**
   * Get event record from Zoho CRM
   * @param {string} entityId - The entity ID
   * @returns {Promise<Object>} The event record
   */
  static async getEventRecord(entityId) {
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

  /**
   * Update event record with presentation URL
   * @param {string} permaLink - The presentation URL
   * @param {string} entityID - The entity ID
   * @returns {Promise<void>}
   */
  static async updateEventRecord(permaLink, entityID) {
    try {
      const config = {
        Entity: "Events",
        APIData: {
          "id": entityID,
          "URL_de_Presentacion": permaLink
        },
        Trigger: ["workflow"]
      };
      await ZOHO.CRM.API.updateRecord(config);
    } catch (error) {
      console.error("Error updating record:", error);
      throw error;
    }
  }

  /**
   * Initialize Zoho SDK
   * @returns {Promise<Object>} The page data
   */
  static initZSDK() {
    return new Promise((resolve) => {
      ZOHO.embeddedApp.on("PageLoad", async function (data) {
        try {
          ZOHO.CRM.UI.Resize({ height: 380, width: 600 });
          resolve(data);
        } catch (error) {
          throw error;
        }
      });

      ZOHO.embeddedApp.init();
    });
  }

  /**
   * Close Zoho popup
   * @returns {Promise<void>}
   */
  static async closePopup() {
    await ZOHO.CRM.UI.Popup.closeReload();
  }
}
