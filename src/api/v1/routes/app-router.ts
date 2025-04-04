//create app routes
import { Router, Request, Response } from "express";
import shipmentsRoutes from "./shipments-routes";
import usersRoutes from "./users-routes";
import statsRouter from "./stats-router";
import containerRoutes from "./containers-routes";
import issuesRouter from "./issues-router";
import excelRoutes from "./excel-routes";
import agenciesRoutes from "./agencies-routes";
import imagesRoutes from "./images-router";
const router = Router();

// API routes
router.use("/shipments", shipmentsRoutes);
router.use("/users", usersRoutes);
router.use("/stats", statsRouter);
router.use("/containers", containerRoutes);
router.use("/excel", excelRoutes);
router.use("/agencies", agenciesRoutes);
router.use("/images", imagesRoutes);
router.use("/issues", issuesRouter);

router.get("/", (req: Request, res: Response) => {
	res.status(200).json({ status: "ok app routes" });
});

export default router;
