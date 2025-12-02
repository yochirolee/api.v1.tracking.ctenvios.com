import { Request, Response } from "express";
import { prisma_db } from "../models/prisma/prisma_db";
import { mysql_db } from "../models/myslq/mysql_db";
import { toCamelCase } from "../utils/_to_camel_case";
import { generateMySqlEvents } from "../utils/_generate_sql_events";
import { flattenShipments, formatSearchResult } from "../utils/_format_response";
import { UpdateMethod } from "@prisma/client";
import { getLocation } from "../utils/_getLocation";
import { supabase_db } from "../models/supabase/supabase_db";
import { hm_api } from "../services/hm-api";
// Define interface outside the object
interface MakeDeliveryInterface {
   hbls: string[];
   statusId: number;
   timestamp: string;
   lat: number;
   loc: number;
}

//merge and normalize events// Tipo final de evento que devuelves en tu API
type TrackingEvent = {
   timestamp: string;
   statusCode: string;
   statusName: string;
   statusDescription?: string | null;
   location?: string | null;
   updateMethod: string;
   userName?: string | null;
   source: "NEW" | "HM";
};

// --- HM helpers ---

const HM_STATUS_MAP: Record<string, { code: string; name: string }> = {
   entradarecibida: {
      code: "AT_WAREHOUSE",
      name: "Entrada en almacén",
   },
   transferenciaalmacen: {
      code: "WAREHOUSE_TRANSFER",
      name: "Transferencia entre almacenes",
   },
   despachomensajero: {
      // NO es entrega aún, es “salió con mensajero”
      code: "OUT_FOR_DELIVERY",
      name: "Despachado a mensajero",
   },
   // agrega más tipos si los necesitas
};

function extractLocationFromDetalle(detalle?: string | null): string | null {
   if (!detalle) return null;

   const regex = /almac[eé]n\s+([^\.]+)/i;
   const match = detalle.match(regex);
   if (match && match[1]) {
      return match[1].trim();
   }

   return null;
}

// Eventos del sistema nuevo (Prisma + generateMySqlEvents)
function mapNewEventToTrackingEvent(ev: any): TrackingEvent {
   const status = ev.status || {};
   const user = ev.user || {};

   // Si vienen timestamps como Date o string, lo normalizamos a ISO
   const ts = ev.timestamp instanceof Date ? ev.timestamp.toISOString() : new Date(ev.timestamp).toISOString();

   return {
      timestamp: ts,
      statusCode: status.code || `STATUS_${status.id || ev.statusId || "UNKNOWN"}`,
      statusName: status.name || "Unknown",
      statusDescription: status.description || null,
      location: ev.location || null,
      updateMethod: ev.updateMethod || "SYSTEM",
      userName: user.name || null,
      source: "NEW",
   };
}

// Eventos del HM (historial viejo)
function mapHmHistoryToTrackingEvent(hm: any): TrackingEvent {
   let statusCfg = HM_STATUS_MAP[hm.tipo] || {
      code: hm.tipo ? hm.tipo.toUpperCase() : "HM_EVENT",
      name: hm.evento || "Evento HM",
   };

   const evento = (hm.evento || "").trim();
   const eventoLower = evento.toLowerCase();
   const detalleLower = (hm.detalle || "").toLowerCase();

   // 🔎 Regla: detectar Entrega Exitosa
   const isEntregaExitosaByEvento = eventoLower === "entrega exitosa";
   const isEntregaExitosaByDetalle = detalleLower.includes("entrega confirmada");

   if (isEntregaExitosaByEvento || isEntregaExitosaByDetalle) {
      statusCfg = {
         code: "DELIVERED",
         name: "Entrega exitosa",
      };
   }

   const ts = hm.fecha_objeto || hm.fecha;

   return {
      timestamp: new Date(ts).toISOString(),
      statusCode: statusCfg.code,
      statusName: statusCfg.name,
      statusDescription: hm.detalle || null,
      location: extractLocationFromDetalle(hm.detalle),
      updateMethod: "HM_HISTORY",
      userName: hm.usuario || null,
      source: "HM",
   };
}

function mergeAndNormalizeEvents(baseEvents: any[], hmHistoryRaw: any): TrackingEvent[] {
   const hmArray = Array.isArray(hmHistoryRaw) ? hmHistoryRaw : hmHistoryRaw?.historial || [];

   const newEvents = (baseEvents || []).map(mapNewEventToTrackingEvent);
   const hmEvents = (hmArray || []).map(mapHmHistoryToTrackingEvent);

   let merged: TrackingEvent[] = [...newEvents, ...hmEvents];

   // 1️⃣ Ordenar cronológicamente
   merged.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

   // 2️⃣ Eliminar duplicados
   const deduped: TrackingEvent[] = [];
   const seen = new Set<string>();
   for (const ev of merged) {
      const key = `${ev.timestamp}|${ev.statusCode}|${ev.location || ""}`;
      if (!seen.has(key)) {
         seen.add(key);
         deduped.push(ev);
      }
   }
   merged = deduped;

   // 3️⃣ Detectar último evento terminal ("Entrega exitosa")
   let lastTerminalIndex = -1;
   merged.forEach((ev, idx) => {
      const code = (ev.statusCode || "").toUpperCase();
      const name = (ev.statusName || "").trim().toLowerCase();

      const isTerminalByCode = code === "DELIVERED";
      const isTerminalByName = name === "entrega exitosa" || name === "entregado";

      if (isTerminalByCode || isTerminalByName) {
         lastTerminalIndex = idx;
      }
   });

   // 4️⃣ Si existe entrega exitosa ⇒ cortar todo lo posterior
   if (lastTerminalIndex >= 0) {
      merged = merged.slice(0, lastTerminalIndex + 1);
   }

   return merged;
}

///////////////////////

export const shipmentsController = {
   getShipments: async (req: Request, res: Response) => {
      try {
         //if user is admin, get all shipments
         //if user is not admin, get shipments by agencyId
         //implementation missing
         //const user = req.user;
         const shipments = await prisma_db.shipments.getShipments({
            limit: req.query.limit ? parseInt(req.query.limit as string) : 25,
            offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
         });

         const flattenedShipments = flattenShipments(shipments.shipments);

         res.json({ shipments: flattenedShipments, total: shipments.totalShipments });
      } catch (error) {
         console.error(error);
         res.status(500).json({ message: "Internal server error" });
      }
   },
   searchShipments: async (req: Request, res: Response) => {
      const search = req.query.query as string;

      const [search_on_mysql, total] = await mysql_db.parcels.search(search);
      if (!search_on_mysql.length) {
         return res.json({ shipments: [], total: 0 });
      }
      // Extract HBLs directly using destructuring for better performance
      const hbls = search_on_mysql.map(({ hbl }: { hbl: string }) => hbl);
      const existingShipments = await prisma_db.shipments.getShipmentsByHbls(hbls);
      const shipments = formatSearchResult(existingShipments, search_on_mysql);

      res.json({
         shipments,
         total,
      });
   },

   getShipmentByHbl: async (req: Request, res: Response) => {
      const hbl = req.params.hbl;
      if (!hbl) {
         return res.status(400).json({ message: "HBL is required" });
      }

      // Timeout wrapper - prevents blocking beyond specified time
      const withTimeout = <T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
         const timeout = new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms));
         return Promise.race([promise, timeout]);
      };

      const [shipment, search_on_mysql, hm_history] = await Promise.all([
         prisma_db.shipments.getShipmentByHbl(hbl),
         mysql_db.parcels.getInHblArray([hbl], true),
         withTimeout(
            hm_api.getShipmentHistory(hbl).catch((error) => {
               console.error(`Failed to fetch shipment history for ${hbl}:`, error.message);
               return [];
            }),
            3000, // Max 3 seconds - then continue without blocking
            []
         ),
      ]);

      const mslq_parcel = search_on_mysql[0];

      if (!mslq_parcel) {
         return res.status(404).json({ message: "Shipment not found" });
      }

      const mysql_events = generateMySqlEvents(mslq_parcel);

      const shippingAddress = toCamelCase(
         [
            toCamelCase(mslq_parcel.cll),
            mslq_parcel.entre_cll ? "entre " + toCamelCase(mslq_parcel.entre_cll) : "",
            mslq_parcel.no ? "No. " + toCamelCase(mslq_parcel.no) : "",
            mslq_parcel.apto ? "Apto. " + toCamelCase(mslq_parcel.apto) : "",
            mslq_parcel.reparto ? "Reparto. " + toCamelCase(mslq_parcel.reparto) : "",
         ]
            .filter(Boolean)
            .join(" ")
      );

      // Eventos base = los que generas de MySQL + los eventos del sistema nuevo (Prisma)
      const baseEvents = [...(mysql_events || []), ...((shipment?.events as any[]) || [])];

      // Normalizamos + unimos con hm_history
      const unifiedEvents = mergeAndNormalizeEvents(baseEvents, hm_history);

      const shipment_with_mysql = {
         hbl: mslq_parcel.hbl,
         invoiceId: mslq_parcel.invoiceId,
         weight: mslq_parcel.weight,
         agency: {
            id: mslq_parcel.agencyId,
            name: mslq_parcel.agency,
         },
         invoiceDate: mslq_parcel.invoiceDate,
         description: toCamelCase(mslq_parcel.description),
         sender: {
            name: toCamelCase(mslq_parcel.sender),
            mobile: mslq_parcel.senderMobile,
         },
         receiver: {
            name: toCamelCase(mslq_parcel.receiver),
            mobile: mslq_parcel.receiverMobile,
            address: shippingAddress,
            ci: mslq_parcel.receiverCi,
            state: mslq_parcel.province,
            city: mslq_parcel.city,
         },
         events: unifiedEvents, // 🔥 ahora ya viene todo homogéneo
      };

      res.json(shipment_with_mysql);
   },
   getByInvoiceId: async (req: Request, res: Response) => {
      try {
         const invoiceId = req.params.invoiceId;
         if (!invoiceId) {
            return res.status(400).json({ message: "Invoice ID is required" });
         }
         const result = await mysql_db.parcels.getByInvoiceId(parseInt(invoiceId));
         if (!result) {
            return res.status(400).json({ message: "No shipments found" });
         }
         res.json(result);
      } catch (error) {
         console.error(error);
         res.status(500).json({ message: "Internal server error" });
      }
   },

   getShipmentsInInvoice: async (req: Request, res: Response) => {
      try {
         const hbl = req.params.hbl;
         if (!hbl) {
            return res.status(400).json({ message: "HBL is required" });
         }
         const result = (await mysql_db.parcels.getAllParcelsInInvoiceByHbl(hbl)) || [];
         if (!result.length) {
            return res.status(400).json({ message: "No shipments found" });
         }

         const shipment_tracking = await prisma_db.shipments.getShipmentsByInvoiceId(result[0].invoiceId);

         const invoiceId = result[0].invoiceId;

         const shippingAddress = toCamelCase(
            [
               toCamelCase(result[0].cll),
               result[0].entre_cll ? "entre " + toCamelCase(result[0].entre_cll) : "",
               result[0].no ? "No. " + toCamelCase(result[0].no) : "",
               result[0].apto ? "Apto. " + toCamelCase(result[0].apto) : "",
               result[0].reparto ? "Reparto. " + toCamelCase(result[0].reparto) : "",
               result[0].provincia ? "Provincia. " + toCamelCase(result[0].state) : "",
               result[0].ciudad ? "Ciudad. " + toCamelCase(result[0].city) : "",
            ]
               .filter(Boolean)
               .join(" ")
         );
         const count = result.length;
         const formattedShipments = {
            invoiceId: invoiceId,
            invoiceDate: result[0].invoiceDate,
            count: count,
            sender: {
               name: toCamelCase(result[0].sender),
               mobile: result[0].senderMobile,
               ci: result[0].senderCi,
            },
            receiver: {
               name: toCamelCase(result[0].receiver),
               mobile: result[0].receiverMobile,
               ci: result[0].receiverCi,
               address: shippingAddress,
               state: result[0].province,
               city: result[0].city,
            },

            shipments: result.map((parcel) => {
               const shipment = shipment_tracking.find((shipment) => shipment.hbl === parcel.hbl);
               return {
                  hbl: parcel.hbl,
                  weight: parcel.weight,
                  description: toCamelCase(parcel.description),
                  status: shipment?.status,
                  timestamp: shipment?.timestamp,
               };
            }),
         };
         return res.json(formattedShipments);
      } catch (error) {
         console.error(error);
         res.status(500).json({ message: "Internal server error" });
      }
   },
   getShipmentsByUserId: async (req: Request, res: Response) => {
      const userId = req.user.userId;
      const shipments = await prisma_db.shipments.getByUserId(userId);
      res.json(shipments);
   },

   //make delivery
   deliveryShipments: async (req: Request, res: Response) => {
      try {
         const { shipments } = req.body;
         const userId = req.user.userId;

         const shipmentsToDelivery = shipments.map((shipment: any) => {
            return {
               hbl: shipment.hbl,
               statusId: shipment.statusId,
               timestamp: shipment.timestamp,
               userId: userId,
               latitude: shipment.latitude,
               longitude: shipment.longitude,
               updateMethod: UpdateMethod.SCANNER,
            };
         });
         console.log(shipmentsToDelivery, "shipmentsToDelivery");

         if (!shipments || !userId) {
            return res.status(400).json({ message: "All fields are required" });
         }
         const { data, error } = await supabase_db.events.upsert(shipmentsToDelivery);

         console.log(data, "data");
         if (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
         }
         res.json(data);
      } catch (error) {
         // Implement the rest of your logic here
         console.error(error);
         res.status(500).json({ message: "Internal server error" });
      }
   },
   scanShipment: async (req: Request, res: Response) => {
      try {
         const { hbl, statusId, timestamp, lat, loc } = req.body;
         const userId = req.user.userId;
         if (!hbl || !statusId || !timestamp || !userId) {
            return res.status(400).json({ message: "All fields are required" });
         }

         const eventData: any[] = [
            {
               hbl,
               userId,
               updateMethod: UpdateMethod.SCANNER,
               timestamp: new Date(timestamp),
               statusId,
               latitude: lat,
               longitude: loc,
            },
         ];

         const shipment = await prisma_db.shipments.scanShipmentTransaction(eventData);

         res.json("ok");
      } catch (error) {
         console.error(error);
         console.log(error);
         res.status(500).json({ message: "Internal server error" });
      }
   },
   scannedShipments: async (req: Request, res: Response) => {
      try {
         const statusId = parseInt(req.params.statusId);
         const userId = req.user.userId;
         if (!statusId) {
            return res.status(400).json({ message: "Status ID is required" });
         }
         const shipments = await prisma_db.shipments.scannedShipments(userId, statusId);
         res.json(shipments);
      } catch (error) {
         console.error(error);
         res.status(500).json({ message: "Internal server error" });
      }
   },
   //a stats for the shipments
};
