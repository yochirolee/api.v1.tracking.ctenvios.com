import { Router } from "express";
import { user_controller } from "../controllers/user-controller";
import { authMiddleware } from "../middlewares/auth-middleware";

const usersRoutes = Router();

//get all users
usersRoutes.get("/", authMiddleware, user_controller.getUsers);
usersRoutes.post("/login", user_controller.login);
usersRoutes.post("/register", authMiddleware, user_controller.createUser);
usersRoutes.put("/:id", authMiddleware, user_controller.updateUser);
usersRoutes.delete("/:id", authMiddleware, user_controller.deleteUser);

export default usersRoutes;
