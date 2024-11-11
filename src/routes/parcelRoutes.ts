import express from "express";
import multer from "multer";
import apicache from "apicache";
import { getAll, getByHbl, importEventsFromExcel, search } from "../controllers/parcelController";
import { authMiddleware, requireRoles } from "../middlewares/authMiddleware";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const cache = apicache.middleware;

router.get("/search", authMiddleware, search);
router.get("/hbl/:hbl", getByHbl);
//router.post("/import", upload.single("file"), importFromExcel);
/*router.post(
 	"/import-events",
	authMiddleware,
	requireRoles(["SUPERADMIN", "ADMIN"]),
	upload.single("file"),
	importEventsFromExcel,
); */
router.post("/import-events", upload.single("file"), importEventsFromExcel);
router.get("/", getAll);

export default router;
