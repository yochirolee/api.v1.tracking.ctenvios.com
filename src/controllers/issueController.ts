import { Request, Response, NextFunction } from "express";
import { prisma_db } from "../databases/prisma/prisma_db";
import Joi from "joi";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const issueSchema = Joi.object({
	hbl: Joi.string().required().trim().messages({
		"string.empty": "HBL cannot be empty",
		"any.required": "HBL is required",
	}),
	eventId: Joi.number().required().messages({
		"number.base": "Event ID is required",
		"any.required": "Event ID is required",
	}),

	description: Joi.string().required().trim().messages({
		"string.empty": "Description cannot be empty",
		"any.required": "Description is required",
	}),

	userId: Joi.string().uuid().required().messages({
		"string.guid": "User ID must be a valid UUID",
		"any.required": "User ID is required",
	}),
	photoUrl: Joi.string().uri().allow(null).messages({
		"string.uri": "Photo URL must be a valid URL",
	}),
});

/**
 * @param next - Express next function for error handling
 */
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const issues = await prisma_db.issues.getAll();
		res.status(200).json(issues);
	} catch (error) {
		console.error("Error in getAllIssues:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const validatedData = await issueSchema.validateAsync(req.body, {
			abortEarly: false,
			stripUnknown: true,
		});

		const issue = await prisma.$transaction(async (tx) => {
			// Update parcel status

			// Create event with required fields
			const event = await tx.event.update({
				where: { id: validatedData.eventId },
				data: { status: validatedData.status },
			});

			// Create issue (excluding parcelStatus)
			const issueData = {
				hbl: event.hbl,
				reason: validatedData.reason,
				userId: event.userId,
				photoUrl: validatedData.photoUrl,
				eventId: event.id,
				createdAt: new Date(),
				resolvedAt: null,
			};

			const issue = await tx.issue.create({ data: issueData as any });

			return issue;
		});

		res.status(201).json(issue);
	} catch (error) {
		if (error instanceof Joi.ValidationError) {
			return res.status(400).json({
				message: "Validation failed",
				errors: error.details.map((detail) => ({
					field: detail.path[0],
					message: detail.message,
				})),
			});
		}
		next(error);
	}
};
