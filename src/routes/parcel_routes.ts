import express from "express";
import multer from "multer";
import apicache from "apicache";
import {
	createEvent,
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

router.get("/search", authMiddleware, search);
router.get("/hbl/:hbl", authMiddleware, getByHbl);
router.post("/upsert-events", authMiddleware, upsertEvents);
router.post("/create-event", createEvent);
router.post(
	"/upload-excel",
	authMiddleware,
	requireRoles(["ROOT", "ADMIN"]),
	upload.single("file"),
	uploadExcelByHbl,
);
router.get("/", authMiddleware, cache("5 minutes"), getAll);

export default router;
