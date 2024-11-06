"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const shemas_1 = require("../shemas/shemas");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// User registration
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, agencyId, role } = req.body;
    console.log(name, email, password, agencyId, role);
    // Validate required fields
    if (!name || !email || !password || !agencyId || !role) {
        return res.status(400).json({ error: "All fields are required" });
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }
    // Validate password strength
    if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }
    // Validate agencyId is a positive integer
    if (!Number.isInteger(agencyId) || agencyId <= 0) {
        return res.status(400).json({ error: "Invalid agencyId" });
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    try {
        const userExists = yield prisma.user.findUnique({ where: { email } });
        if (userExists) {
            return res.status(400).json({ error: "User already exists" });
        }
        const user = yield prisma.user.create({
            data: { name, email, password: hashedPassword, agencyId, role },
        });
        res.json({ message: "User registered successfully", userId: user.id });
    }
    catch (error) {
        res.status(400).json({ error, message: "registration failed" });
    }
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req);
        const result = shemas_1.schemas.loginSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.errors });
        }
        const { email, password } = result.data;
        const user = yield prisma.user.findUnique({ where: { email } });
        if (user && (yield bcrypt_1.default.compare(password, user.password))) {
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role, agencyId: user.agencyId }, process.env.JWT_SECRET, { expiresIn: "4h" });
            res.json({ token });
        }
        else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: error.errors });
        }
        else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
}));
// Get all users (admin only)
router.get("/", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== client_1.Role.ADMIN && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== client_1.Role.SUPERADMIN) {
        return res.status(403).json({ error: "Unauthorized access" });
    }
    const users = yield prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            agencyId: true,
        },
    });
    res.json(users);
}));
// Get user by ID
router.get("/:id", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { id } = req.params;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== id && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== client_1.Role.ADMIN && ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) !== client_1.Role.SUPERADMIN) {
        return res.status(403).json({ error: "Unauthorized access" });
    }
    try {
        const user = yield prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });
        if (user) {
            res.json(user);
        }
        else {
            res.status(404).json({ error: "User not found" });
        }
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}));
// Update user
router.put("/:id", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { id } = req.params;
    const { name, email, role } = req.body;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== id && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== client_1.Role.ADMIN && ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) !== client_1.Role.SUPERADMIN) {
        return res.status(403).json({ error: "Unauthorized access" });
    }
    try {
        const updatedUser = yield prisma.user.update({
            where: { id },
            data: { name, email, role },
        });
        res.json(updatedUser);
    }
    catch (error) {
        res.status(400).json({ error: "Update failed" });
    }
}));
// Delete user (admin only)
router.delete("/:id", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== client_1.Role.ADMIN && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== client_1.Role.SUPERADMIN) {
        return res.status(403).json({ error: "Unauthorized access" });
    }
    try {
        yield prisma.user.delete({ where: { id } });
        res.json({ message: "User deleted successfully" });
    }
    catch (error) {
        res.status(400).json({ error: "Delete failed" });
    }
}));
exports.default = router;
