import { Router } from "express";
import { issuesController } from "../controllers/issues-controller";
import { authMiddleware } from "../middlewares/auth-middleware";
const issuesRouter = Router();

issuesRouter.get("/", issuesController.getIssues);
issuesRouter.get("/:id", issuesController.getIssueById);
issuesRouter.post("/", authMiddleware, issuesController.createIssue);
issuesRouter.put("/:id", authMiddleware, issuesController.updateIssue);
issuesRouter.delete("/:id", authMiddleware, issuesController.deleteIssue);
issuesRouter.post("/:id/comments", authMiddleware, issuesController.createIssueComment);

export default issuesRouter;
