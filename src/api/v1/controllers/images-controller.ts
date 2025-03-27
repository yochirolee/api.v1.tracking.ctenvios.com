import { Request, Response } from "express";
import supabase from "../config/supabase-client";
import sharp from "sharp";
import { prisma_db } from "../models/prisma/prisma_db";

const BUCKET_NAME = "uploads";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const imagesController = {
	uploadImages: async (req: Request, res: Response) => {
		try {
			console.log(req.file, "req.files");
			console.log(req.body, "req.body");
			if (!req.file) return res.status(400).json({ error: "No file uploaded" });

			const { originalname, buffer, mimetype, size } = req.file;

			// Validate file size
			if (size > MAX_FILE_SIZE) {
				return res.status(400).json({ error: "File size exceeds 5MB limit" });
			}

			// Validate mime type
			if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
				return res
					.status(400)
					.json({ error: "Invalid file type. Only JPEG, PNG, and WebP are allowed" });
			}

			// Optimize image
			const optimizedBuffer = await sharp(buffer)
				.resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
				.webp({ quality: 80 })
				.toBuffer();

			const filePath = `${Date.now()}-${originalname.replace(/\s+/g, "-")}`;

			// Upload optimized file
			const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, optimizedBuffer, {
				contentType: "image/webp",
				upsert: true,
			});

			if (error) {
				console.error("Storage error:", error);
				return res.status(400).json({ error: "Storage upload failed. Please check permissions." });
			}

			// Get public URL (if the bucket is public)
			const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

			if (!publicUrlData?.publicURL) {
				return res.status(400).json({ error: "Failed to generate public URL" });
			}

			// Get current event data
			const currentEvent = await prisma_db.eventImages.create({
				eventId: parseInt(req.body.eventsId),
				image: publicUrlData.publicURL,
			});

			console.log(currentEvent, "currentEvent");

			res.json({
				message: "File uploaded successfully",
				url: publicUrlData.publicURL,
			});
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
			console.error("Upload error:", errorMessage);
			res.status(500).json({ error: "Image processing failed" });
		}
	},
};
