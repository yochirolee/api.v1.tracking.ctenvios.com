"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const apicache_1 = __importDefault(require("apicache"));
const parcelController_1 = require("../controllers/parcelController");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const cache = apicache_1.default.middleware;
router.get("/search", parcelController_1.search);
router.get("/hbl/:hbl", parcelController_1.getByHbl);
//router.post("/import", upload.single("file"), importFromExcel);
router.post("/import-events", upload.single("file"), parcelController_1.importEventsFromExcel);
router.get("/", cache("1 minutes"), parcelController_1.getAll);
exports.default = router;
