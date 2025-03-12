import { Router } from "express";
import { imagesController } from "../controllers/images-controller";
import multer from "multer";
import { authMiddleware } from "../middlewares/auth-middleware";

const imagesRoutes = Router();

const upload = multer({ storage: multer.memoryStorage() });

imagesRoutes.post(
	"/upload-images",
	upload.single("file"),

	imagesController.uploadImages,
);

export default imagesRoutes;
