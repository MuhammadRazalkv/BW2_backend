import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.util.js";
import { HttpStatus } from "../constants/statusCodes.js";
import { messages } from "../constants/httpMessages.js";
import { isValidPdfId } from "../utils/pdfIdValidation.js";

export const validateExtractRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { pdfId, pages } = req.query;

  //  Validate pdfId
  if (!pdfId || typeof pdfId !== "string") {
    return sendError(res, HttpStatus.BAD_REQUEST, messages.INVALID_PDF_ID);
  }
  if (!isValidPdfId(pdfId)) {
    sendError(res, HttpStatus.BAD_REQUEST, messages.INVALID_PDF_ID);
    return;
  }
  //  Validate pages existence
  if (!pages || typeof pages !== "string") {
    return sendError(res, HttpStatus.BAD_REQUEST, messages.NO_PAGES_PROVIDED);
  }

  //  Parse pages → number[]
  const parsedPages = pages
    .split(",")
    .map((p) => Number(p.trim()))
    .filter((p) => !Number.isNaN(p));

  if (parsedPages.length === 0) {
    return sendError(res, HttpStatus.BAD_REQUEST, messages.INVALID_PAGE_NUMBER);
  }

  //  Validate page numbers
  for (const page of parsedPages) {
    if (!Number.isInteger(page) || page < 1) {
      return sendError(
        res,
        HttpStatus.BAD_REQUEST,
        messages.INVALID_PAGE_NUMBER,
      );
    }
  }

  //  Remove duplicates
  const uniquePages = [...new Set(parsedPages)];

  if (uniquePages.length !== parsedPages.length) {
    return sendError(res, HttpStatus.BAD_REQUEST, messages.DUPLICATES_FOUND);
  }

  //  Attach normalized data
  // req.query.pages = uniquePages;
  req.validatedExtract = {
    pdfId,
    pages: uniquePages,
  };

  next();
};
