import { Router } from "express";
import { getAll, create, resolve } from "../controllers/issueController";

const router = Router();

router.get("/", getAll);
router.post("/", create);
router.put("/:id", resolve);

export default router;
