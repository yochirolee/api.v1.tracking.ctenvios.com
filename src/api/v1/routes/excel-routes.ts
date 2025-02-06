import { Router } from "express";
import { excelController } from "../controllers/excel-controller";
import multer from "multer";
import { authMiddleware } from "../middlewares/auth-middleware";

const excelRoutes = Router();

const upload = multer({ storage: multer.memoryStorage() });

excelRoutes.post("/upload-excel", upload.single("file"), authMiddleware, excelController.uploadExcel);

export default excelRoutes;
