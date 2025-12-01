import { Agency, Container, IssueComments, Issues, ShipmentEvent, User } from "@prisma/client";
import { prisma } from "../../config/prisma-client";
import { supabase_db } from "../supabase/supabase_db";
import e from "express";

export const prisma_db = {
   users: {
      getUsers: async ({ limit = 10, page = 1 }: { limit?: number; page?: number }) => {
         const users = await prisma.user.findMany({
            select: {
               id: true,
               name: true,
               email: true,
               role: true,
               agencyId: true,
               lastLogin: true,
               isActive: true,
               createdAt: true,
               updatedAt: true,

               agency: {
                  select: {
                     id: true,
                     name: true,
                  },
               },
            },

            skip: (page - 1) * limit,
            take: limit,
         });
         return users;
      },
      getUserById: async (id: string) => {
         const user = await prisma.user.findUnique({ where: { id } });
         return user;
      },
      getUserByEmail: async (email: string) => {
         const user = await prisma.user.findUnique({ where: { email } });
         return user;
      },

      createUser: async (
         data: Omit<User, "id" | "isActive" | "lastLogin" | "refreshToken" | "createdAt" | "updatedAt">
      ) => {
         const newUser: User = await prisma.user.create({ data });
         return newUser;
      },
      updateUser: async (id: string, data: Partial<User>) => {
         console.log("updating user on db");
         const updatedUser: Partial<User> = await prisma.user.update({
            where: { id },
            data,
         });
         return updatedUser;
      },
      deleteUser: async (id: string) => {
         const deletedUser = await prisma.user.delete({ where: { id } });
         return deletedUser;
      },
   },
   shipments: {
      getShipments: async ({ limit = 20, offset = 0 }: { limit?: number; offset?: number }) => {
         const [shipments, totalShipments] = await Promise.all([
            prisma.shipment.findMany({
               select: {
                  hbl: true,
                  invoiceId: true,
                  description: true,
                  state: true,
                  city: true,
                  sender: true,
                  receiver: true,
                  timestamp: true,
                  weight: true,
                  agency: {
                     select: {
                        id: true,
                        name: true,
                     },
                  },
                  status: {
                     select: {
                        id: true,
                        name: true,
                        code: true,
                        description: true,
                     },
                  },
               },
               orderBy: { timestamp: "desc" },
               take: limit,
               skip: offset,
            }),
            prisma.shipment.count(),
         ]);
         return { shipments, totalShipments };
      },

      //search shipments by hbl or invoiceId or description or sender or receiver
      //if better to implement a full text search, we can use a library like pg_search

      getShipmentByHbl: async (hbl: string) => {
         const shipment = await prisma.shipment.findUnique({
            where: { hbl },
            include: {
               events: {
                  include: {
                     status: true,
                     images: true,
                     user: {
                        select: {
                           id: true,
                           name: true,
                        },
                     },
                  },
                  orderBy: { timestamp: "asc" },
               },
            },
         });

         return shipment;
      },
      getShipmentsByHbls: async (hbls: string[]) => {
         const shipments = await prisma.shipment.findMany({
            where: { hbl: { in: hbls } },
            select: {
               hbl: true,
               invoiceId: true,
               description: true,
               state: true,
               city: true,
               sender: true,
               receiver: true,
               timestamp: true,
               weight: true,
               agency: {
                  select: {
                     id: true,
                     name: true,
                  },
               },
               status: {
                  select: {
                     id: true,
                     name: true,
                     code: true,
                     description: true,
                  },
               },
            },
            orderBy: { timestamp: "desc" },
         });

         return shipments;
      },

      //tx to update a shipment and the events
      scanShipmentTransaction: async (data: any[]) => {
         const { data: supabaseData, error } = await supabase_db.events.upsert(data);
         console.log(supabaseData, "eventData");
         console.log(error, "eventsError");

         if (error) {
            throw new Error(error.message);
         }
      },

      scannedShipments: async (userId: string, statusId: number) => {
         const twentyFourHoursAgo = new Date(new Date().setHours(new Date().getHours() - 12));
         const shipments = await prisma.shipment.findMany({
            where: {
               userId,
               statusId,
               timestamp: {
                  gte: twentyFourHoursAgo,
               },
            },
         });
         return shipments;
      },
      getShipmentsByInvoiceId: async (invoiceId: number) => {
         const shipments = await prisma.shipment.findMany({
            where: { invoiceId },
            select: {
               hbl: true,
               invoiceId: true,
               description: true,
               timestamp: true,
               sender: true,
               receiver: true,
               agency: {
                  select: {
                     name: true,
                  },
               },
               status: {
                  select: {
                     id: true,
                     name: true,
                  },
               },
               state: true,
               city: true,
            },
         });
         return shipments.flatMap((shipment) => {
            return {
               hbl: shipment.hbl,
               invoiceId: shipment.invoiceId,
               description: shipment.description,
               agency: shipment?.agency?.name,
               state: shipment.state,
               city: shipment.city,
               status: shipment.status.name,
               timestamp: shipment.timestamp,
               sender: shipment.sender,
               receiver: shipment.receiver,
            };
         });
      },
      getByUserId: async (userId: string, limit = 1000, offset = 0) => {
         console.log(userId, limit, offset);
         const shipments = await prisma.shipment.findMany({
            where: { userId },
            include: {
               status: true,
               agency: true,
            },
            orderBy: { timestamp: "desc" },
            take: limit,
            skip: offset,
         });
         return shipments;
      },
   },
   shipmentEvents: {
      updateShipmentEvent: async (data: any) => {
         const shipmentEvent = await prisma.shipmentEvent.update({ where: { id: data.id }, data });
         return shipmentEvent;
      },
      getShipmentEventById: async (id: number) => {
         const shipmentEvent = await prisma.shipmentEvent.findUnique({ where: { id } });
         return shipmentEvent;
      },
   },
   eventImages: {
      createMany: async (data: any) => {
         const eventImage = await prisma.eventImages.createMany({ data });
         return eventImage;
      },
      update: async (data: any) => {
         const eventImage = await prisma.eventImages.update({ where: { id: data.id }, data });
         return eventImage;
      },
      delete: async (id: number) => {
         const eventImage = await prisma.eventImages.delete({ where: { id } });
         return eventImage;
      },
   },

   containers: {
      getContainerWithShipmentsById: async (id: number) => {
         const container = await prisma.container.findUnique({
            where: { id },
            include: {
               shipments: {
                  include: {
                     status: {
                        select: {
                           id: true,
                           name: true,
                           code: true,
                           description: true,
                        },
                     },
                     agency: {
                        select: {
                           id: true,
                           name: true,
                        },
                     },
                  },
                  orderBy: { timestamp: "desc" },
               },
            },
         });
         return container;
      },
      getContainers: async () => {
         const containers = await prisma.container.findMany();
         return containers;
      },
      upsertContainer: async (data: Container) => {
         const container = await prisma.container.upsert({
            where: { id: data.id },
            update: data,
            create: data,
         });
         return container;
      },
      deleteContainer: async (id: number) => {
         const container = await prisma.container.delete({ where: { id } });
         return container;
      },
   },
   agencies: {
      getAgencies: async () => {
         const agencies = await prisma.agency.findMany();
         return agencies;
      },
      getAgencyById: async (id: number) => {
         const agency = await prisma.agency.findUnique({ where: { id } });
         return agency;
      },
      createAgency: async (data: Agency) => {
         const agency = await prisma.agency.create({ data });
         return agency;
      },
   },
   issues: {
      getIssues: async ({ limit = 10, page = 1 }: { limit?: number; page?: number } = {}) => {
         const issues = await prisma.issues.findMany({
            include: {
               _count: {
                  select: {
                     comments: true,
                  },
               },
               user: {
                  select: {
                     id: true,
                     name: true,
                  },
               },
               shipment: {
                  select: {
                     invoiceId: true,
                     agency: {
                        select: {
                           id: true,
                           name: true,
                        },
                     },
                     description: true,
                     status: {
                        select: {
                           id: true,
                           name: true,
                        },
                     },
                  },
               },
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: {
               timestamp: "desc",
            },
         });

         const result = issues.map((issue) => {
            return {
               id: issue.id,
               hbl: issue.hbl,
               invoiceId: issue.shipment.invoiceId,
               priority: issue.priority,
               type: issue.type,
               description: issue.description,
               resolved: issue.resolved,
               resolvedAt: issue.resolvedAt,
               timestamp: issue.timestamp,
               user: issue.user,
               comments: issue._count.comments,
               agency: issue.shipment.agency,
               shipmentDescription: issue.shipment.description,
               status: issue.shipment.status,
            };
         });
         return result;
      },
      getIssuesWithComments: async () => {
         const issues = await prisma.issues.findMany({
            include: {
               comments: true,
            },
         });
         return issues;
      },

      getIssueById: async (id: number) => {
         const issue = await prisma.issues.findUnique({
            where: { id },
            include: {
               comments: true,
            },
         });
         return issue;
      },
      createIssue: async (data: Pick<Issues, "hbl" | "description" | "type" | "userId" | "priority">) => {
         const shipment = await prisma.shipment.update({
            where: { hbl: data.hbl },
            data: {
               statusId: 11,
               timestamp: new Date(),
            },
         });
         if (!shipment) {
            throw new Error("Shipment not found");
         }

         const issue = await prisma.issues.create({
            data: { ...data },
         });
         return issue;
      },
      updateIssue: async (id: number, data: Partial<Issues>) => {
         const issue = await prisma.issues.update({ where: { id }, data });
         return issue;
      },

      deleteIssue: async (id: number, userId: string): Promise<Issues> => {
         const issue = await prisma.issues.findUnique({
            where: { id },
         });

         if (!issue || issue.userId !== userId) {
            throw new Error("Unauthorized: Only the issue owner can delete it");
         }

         const deletedIssue = await prisma.issues.delete({ where: { id } });
         return deletedIssue;
      },
   },
   issueComments: {
      createIssueComment: async (data: Pick<IssueComments, "issueId" | "comment" | "userId">) => {
         const issueComment = await prisma.issueComments.create({ data });
         return issueComment;
      },
      updateIssueComment: async (id: number, data: Partial<IssueComments>, userId: string): Promise<IssueComments> => {
         const comment = await prisma.issueComments.findUnique({
            where: { id },
         });

         if (!comment || comment.userId !== userId) {
            throw new Error("Unauthorized: Only the comment owner can update it");
         }

         const issueComment = await prisma.issueComments.update({
            where: { id },
            data,
         });
         return issueComment;
      },
      deleteIssueComment: async (id: number, userId: string): Promise<IssueComments> => {
         const comment = await prisma.issueComments.findUnique({
            where: { id },
         });

         if (!comment || comment.userId !== userId) {
            throw new Error("Unauthorized: Only the comment owner can delete it");
         }

         const issueComment = await prisma.issueComments.delete({ where: { id } });
         return issueComment;
      },
   },

   stats: {
      containersStatus: async () => {
         const containers = await prisma.container.findMany({
            select: {
               id: true,
               containerNumber: true,
               shipments: {
                  select: {
                     status: {
                        select: {
                           id: true,
                           name: true,
                           code: true,
                        },
                     },
                  },
               },
            },
            orderBy: { id: "desc" },
            take: 24,
         });

         const formattedContainers = containers?.map((container) => {
            const status: Record<string, number> = {};

            // Count occurrences of each status
            const statusCounts = container.shipments.reduce((acc: Record<string, number>, shipment) => {
               const statusName = shipment.status.code;
               acc[statusName] = (acc[statusName] || 0) + 1;
               return acc;
            }, {});

            return {
               id: container.id,
               containerNumber: container.containerNumber,
               status: statusCounts,
               count: container.shipments.length,
            };
         });
         return formattedContainers;
      },
      deliveryTodays: async () => {
         const today = new Date();
         const startOfDay = new Date(today.setHours(0, 0, 0, 0));
         const endOfDay = new Date(today.setHours(23, 59, 59, 999));
         const deliveryTodays = await prisma.shipment.groupBy({
            by: ["state"],
            where: {
               timestamp: {
                  gte: startOfDay,
                  lt: endOfDay,
               },
            },
            _count: {
               _all: true,
            },
            orderBy: {
               state: "desc",
            },
         });

         return deliveryTodays.map((item) => ({
            name: item.state,
            count: item._count._all,
         }));
      },
   },
};
