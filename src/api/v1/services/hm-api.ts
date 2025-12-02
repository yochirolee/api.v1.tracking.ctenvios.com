import axios from "axios";

const url = "http://72.60.114.241/api";

// Configure axios with timeout for history API
const historyClient = axios.create({
   timeout: 2000, // 2 second timeout - fail fast if slow
   validateStatus: (status) => status < 500, // Don't throw on 404
});

export const hm_api = {
   getShipmentHistory: async (hbl: string) => {
      try {
         const response = await historyClient.get(`${url}/historial/envio/${hbl}`);

         // Return empty array if not found (404) or other client errors
         if (response.status === 404 || response.status >= 400) {
            return [];
         }

         return response.data;
      } catch (error) {
         // Timeout or network error - return empty array
         const errorMessage = error instanceof Error ? error.message : String(error);
         console.error(`History API timeout/error for ${hbl}:`, errorMessage);
         return [];
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
