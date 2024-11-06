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
exports.resolve = exports.create = exports.getAll = void 0;
const prisma_db_1 = require("../databases/prisma/prisma_db");
const joi_1 = __importDefault(require("joi"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const issueSchema = joi_1.default.object({
    hbl: joi_1.default.string().required().trim().messages({
        "string.empty": "HBL cannot be empty",
        "any.required": "HBL is required",
    }),
    eventId: joi_1.default.number().required().messages({
        "number.base": "Event ID is required",
        "any.required": "Event ID is required",
    }),
    description: joi_1.default.string().required().trim().messages({
        "string.empty": "Description cannot be empty",
        "any.required": "Description is required",
    }),
    userId: joi_1.default.string().uuid().required().messages({
        "string.guid": "User ID must be a valid UUID",
        "any.required": "User ID is required",
    }),
    photoUrl: joi_1.default.string().uri().allow(null).messages({
        "string.uri": "Photo URL must be a valid URL",
    }),
    parcelStatus: joi_1.default.string()
        .valid("NO_DECLARADO", "ROTO", "RETASADO", "MOJADO", "DERRAME", "CON_FALTANTE", "PERDIDO", "OTRO", "ENTREGA_FALLIDA")
        .required()
        .messages({
        "any.only": "Parcel status must be NO_DECLARADO, ROTO, MOJADO, DERRAME, CON_FALTANTE, PERDIDO, or OTRO",
    }),
});
/**
 * @param next - Express next function for error handling
 */
const getAll = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const issues = yield prisma_db_1.prisma_db.issues.getAll();
        res.status(200).json(issues);
    }
    catch (error) {
        console.error("Error in getAllIssues:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAll = getAll;
const create = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    /* try {
        console.log(req.body);
        const validatedData = await issueSchema.validateAsync(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        const issue = await prisma.$transaction(async (tx) => {
            // Update parcel status
            
            // Create event with required fields
            const event = await tx.event.update({
                where: { id: validatedData.eventId },
                data: { status: updatedParcel.status, type: EventType.ISSUE },
            });

            // Create issue (excluding parcelStatus)
            const issueData = {
                hbl: updatedParcel.hbl,
                description: validatedData.description,
                status: IssueStatus.OPEN,
                userId: updatedParcel.userId,
                photoUrl: validatedData.photoUrl,
                eventId: event.id,
                createdAt: new Date(),
                resolvedAt: null,
            };

            const issue = await tx.issue.create({ data: issueData as any });

            return { issue, event };
        });

        res.status(201).json(issue);
    } catch (error) {
        if (error instanceof Joi.ValidationError) {
            return res.status(400).json({
                message: "Validation failed",
                errors: error.details.map((detail) => ({
                    field: detail.path[0],
                    message: detail.message,
                })),
            });
        }
        next(error);
    } */
});
exports.create = create;
const resolve = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const issue = yield prisma_db_1.prisma_db.issues.resolve(parseInt(req.params.id));
        res.status(200).json(issue);
    }
    catch (error) {
        next(error);
    }
});
exports.resolve = resolve;
