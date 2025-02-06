import { Router } from "express";
import { issuesController } from "../controllers/issues-controller";

const issuesRouter = Router();

issuesRouter.get("/", issuesController.getIssues);
issuesRouter.get("/:id", issuesController.getIssueById);
issuesRouter.post("/", issuesController.upsertIssue);

export default issuesRouter;
