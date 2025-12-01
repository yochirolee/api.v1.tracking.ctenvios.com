import axios from "axios";

const url = "http://72.60.114.241/api";
export const hm_api = {
   getShipmentHistory: async (hbl: string) => {
      try {
         const response = await axios.get(`${url}/historial/envio/${hbl}`);
         return response.data;
      } catch (error) {
         console.error(error);
         throw new Error(`Error getting shipment history: ${error}`);
      }
   },
   getShipmentsHistoryByManifest: async (containerNumber: string) => {
      const response = await axios.get(`${url}/manifiesto/${containerNumber}`);
      return response.data;
   },
   findManifestByContainerNumber: async (containerNumber: string) => {
      const allManifests = await axios.get(`${url}/manifiestos`);
      return allManifests.data;
   },
};
