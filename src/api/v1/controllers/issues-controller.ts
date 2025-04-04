//issues controller
import { Request, Response } from "express";
import { prisma_db } from "../models/prisma/prisma_db";
import { z } from "zod";
import { IssueType, IssuePriority } from "@prisma/client";
const issueSchema = z.object({
	hbl: z.string(),

	description: z.string(),
	type: z.nativeEnum(IssueType),
	priority: z.nativeEnum(IssuePriority),
	userId: z.string(),
	resolvedById: z.string().optional().nullable(),
	resolvedAt: z.date().optional().nullable(),
	resolved: z.boolean().optional().default(false),

	// Remove optional fields that are handled by Prisma
});

const commentSchema = z.object({
	issueId: z.number(),
	comment: z.string(),
	userId: z.string(),
	updatedAt: z.date().optional().nullable(),
	createdAt: z.date().optional().nullable(),
});

export const issuesController = {
	getIssues: async (req: Request, res: Response) => {
		const issues = await prisma_db.issues.getIssues();
		console.log(issues, "issues");
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
	upsertIssue: async (req: Request, res: Response) => {},
	createIssue: async (req: Request, res: Response) => {
		try {
			const userId = req.user?.userId;
			const { data: issueData, error } = issueSchema.safeParse({ ...req.body, userId });

			if (error) {
				return res.status(400).json({
					error: "Validation failed",
					details: error.errors.map((err) => ({
						field: err.path.join("."),
						message: err.message,
						code: err.code,
					})),
				});
			}

			const issue = await prisma_db.issues.createIssue(issueData);
			res.status(200).json(issue);
		} catch (error) {
			console.log(error, "error");
			res.status(500).json({ error: "Failed to create issue", details: error });
		}
	},
	updateIssue: async (req: Request, res: Response) => {
		try {
			const issue = await prisma_db.issues.updateIssue(Number(req.params.id), req.body);
			res.status(200).json(issue);
		} catch (error) {
			res.status(500).json({ error: "Failed to update issue" });
		}
	},
	deleteIssue: async (req: Request, res: Response) => {
		try {
			const userId = req.user?.userId;
			const issue = await prisma_db.issues.deleteIssue(Number(req.params.id), userId);
			res.status(200).json(issue);
		} catch (error) {
			res.status(500).json({ error: "Failed to delete issue", details: error });
		}
	},
	createIssueComment: async (req: Request, res: Response) => {
		try {
			const userId = req.user?.userId;
			const issueId = Number(req.params.id);
			const { data: issueCommentData, error } = commentSchema.safeParse({
				...req.body,
				issueId,
				userId,
			});
			if (error) {
				return res.status(400).json({
					error: "Validation failed",
					details: error.errors.map((err) => ({
						field: err.path.join("."),
						message: err.message,
						code: err.code,
					})),
				});
			}

			const issueComment = await prisma_db.issueComments.createIssueComment(issueCommentData);

			res.status(200).json(issueComment);
		} catch (error) {
			res.status(500).json({ error: "Failed to create issue comment", details: error });
		}
	},
};
