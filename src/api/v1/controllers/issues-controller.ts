//issues controller
import { Request, Response } from "express";
import { prisma_db } from "../models/prisma/prisma_db";
import { z } from "zod";

const schema = z.object({
	hbl: z.string(),
	description: z.string(),
	type: z.enum(["DAMAGE", "DELAY", "INCORRECT_LABEL", "LOST", "OTHER"]),
	userId: z.string(),
	imageUrl: z.string().optional(),
	// Remove optional fields that are handled by Prisma
});

export const issuesController = {
	getIssues: async (req: Request, res: Response) => {
		const issues = await prisma_db.issues.getIssues();
		res.status(200).json(issues);
	},
	getIssuesWithComments: async (req: Request, res: Response) => {
		const issues = await prisma_db.issues.getIssuesWithComments();
		res.status(200).json(issues);
	},
	getIssueById: async (req: Request, res: Response) => {
		const issue = await prisma_db.issues.getIssueById(Number(req.params.id));
		res.status(200).json(issue);
	},
	upsertIssue: async (req: Request, res: Response) => {
		const issueData = schema.safeParse(req.body);
		if (!issueData.success) {
			return res.status(400).json({ errors: issueData.error.format() });
		}
		const issue = await prisma_db.issues.createIssue(issueData.data);
		res.status(200).json(issue);
	},
};
