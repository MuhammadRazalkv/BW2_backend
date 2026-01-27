import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.util.js";
import { HttpStatus } from "../constants/statusCodes.js";
import { messages } from "../constants/httpMessages.js";
import { isValidPdfId } from "../utils/pdfIdValidation.js";

export const validateFetchRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { pdfId } = req.query;

  //  Validate pdfId
  if (!pdfId || typeof pdfId !== "string") {
    sendError(res, HttpStatus.BAD_REQUEST, messages.INVALID_PDF_ID);
    return;
  }
  if (!isValidPdfId(pdfId)) {
    sendError(res, HttpStatus.BAD_REQUEST, messages.INVALID_PDF_ID);
    return;
  }

  //  Attach normalized data
  req.pdfId = pdfId;

  next();
};
