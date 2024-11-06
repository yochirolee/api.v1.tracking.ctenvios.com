"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    // Default error values
    const statusCode = err.statusCode || 500;
    let errorResponse = {
        message: err.message || "Something went wrong!",
        error: {
            type: err.name,
            code: err.code,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }
    };
    // Send the error response
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
