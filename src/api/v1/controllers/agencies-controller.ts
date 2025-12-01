import { Request, Response } from "express";
import { prisma_db } from "../models/prisma/prisma_db";

export const agencies_controller = {
   getAgencies: async (req: Request, res: Response) => {
      const agencies = await prisma_db.agencies.getAgencies();
      res.json(agencies);
   },
};
