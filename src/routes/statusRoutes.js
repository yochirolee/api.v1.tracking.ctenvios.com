"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const statusController_1 = require("../controllers/statusController");
const router = express_1.default.Router();
const statusController = new statusController_1.StatusController();
// Get all statuses
router.get("/", statusController.getAllStatuses);
exports.default = router;
