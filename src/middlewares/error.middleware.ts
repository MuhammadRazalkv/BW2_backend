import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app.error.js";
import { HttpStatus } from "../constants/statusCodes.js";
import { messages } from "../constants/httpMessages.js";
const errorHandler = async (
  err: AppError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  let msg = messages.SERVER_ERROR;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    msg = err.message;
  } else {
    console.error("Unhandled Error:", err);
    msg = err.message || messages.SERVER_ERROR;
  }
  res.status(statusCode).json({ message: msg });
};
export default errorHandler;
