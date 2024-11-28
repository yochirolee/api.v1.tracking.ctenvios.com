import express from "express";
import multer from "multer";
import apicache from "apicache";
import {
	getAll,
	getByHbl,
	search,
	uploadExcelByHbl,
	upsertEvents,
} from "../controllers/parcelController";
import { authMiddleware, requireRoles } from "../middlewares/authMiddleware";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const cache = apicache.middleware;

router.get("/search", authMiddleware, cache("5 minutes"), search);
router.get("/hbl/:hbl", authMiddleware, cache("5 minutes"), getByHbl);
router.post("/upsert-events", authMiddleware, upsertEvents);
router.post(
	"/upload-excel",
	authMiddleware,
	requireRoles(["ROOT", "ADMIN"]),
	upload.single("file"),
	uploadExcelByHbl,
);
router.get("/", authMiddleware, cache("5 minutes"), getAll);

export default router;
