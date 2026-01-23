import { Request, Response, NextFunction } from "express";
import IPdfService from "../services/interface/pdf.service.interface";
import IPdfController from "./interface/pdf.controller.interface";
import { sendSuccess } from "../utils/response.util";
import { HttpStatus } from "../constants/statusCodes";
import { messages } from "../constants/httpMessages";

export default class PdfController implements IPdfController {
  constructor(private _pdfService: IPdfService) {}
  uploadPdf = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.pdf_session_id!;
      const { buffer, originalname, mimetype, size } = req.file!;
      const pdfId = await this._pdfService.savePdf(sessionId, {
        buffer,
        originalName: originalname,
        mimeType: mimetype,
        size,
      });
      sendSuccess(res, HttpStatus.CREATED, { pdfId }, messages.CREATED);
    } catch (error) {
      next(error);
    }
  };
}
