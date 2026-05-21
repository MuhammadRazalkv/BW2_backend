import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.util";
import { HttpStatus } from "../constants/statusCodes";
import { messages } from "../constants/httpMessages";
import { isValidPdfId } from "../utils/pdfIdValidation";

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
