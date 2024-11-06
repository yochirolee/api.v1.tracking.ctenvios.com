import { Request, Response, NextFunction } from "express";

// Custom error interface to handle status codes
interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
