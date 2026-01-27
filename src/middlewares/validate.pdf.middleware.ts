import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.util.js";
import { HttpStatus } from "../constants/statusCodes.js";
import { messages } from "../constants/httpMessages.js";

const MAX_PDF_SIZE = 10 * 1024 * 1024;
const PDF_MAGIC = "%PDF-";

export const validatePdfUpload = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const file = req.file;

  if (!file) {
    sendError(res, HttpStatus.BAD_REQUEST, messages.NO_FILE_UPLOADED);
    return;
  }

  if (file.size > MAX_PDF_SIZE) {
    sendError(res, HttpStatus.BAD_REQUEST, messages.SIZE_LIMIT_EXCEEDED);
    return;
  }

  if (file.mimetype !== "application/pdf") {
    sendError(res, HttpStatus.BAD_REQUEST, messages.NOT_A_PDF_FILE);
    return;
  }

  const header = file.buffer.subarray(0, 5).toString("utf-8");

  if (header !== PDF_MAGIC) {
    sendError(res, HttpStatus.BAD_REQUEST, messages.INVALID_PDF);
    return;
  }

  next();
};
