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

  extractPdf = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.pdf_session_id!;
      const { pdfId, pages } = req.validatedExtract!;

      const pdfBytes = await this._pdfService.downloadPdf(
        sessionId,
        pdfId,
        pages,
      );
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="extracted.pdf"',
      );

      res.status(HttpStatus.OK).send(Buffer.from(pdfBytes));
    } catch (error) {
      next(error);
    }
  };

  listPdf = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.pdf_session_id!;
      const list = await this._pdfService.pdfHistory(sessionId);
      sendSuccess(res, HttpStatus.OK, { list }, messages.OK);
    } catch (error) {
      next(error);
    }
  };
  fetchPdf = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("fetch pdf");

      const sessionId = req.pdf_session_id!;
      const pdfId = req.pdfId!;
      console.log("pdfId", pdfId);

      const pdfBytes = await this._pdfService.getPdf(sessionId, pdfId);
      res.setHeader("Content-Type", "application/pdf");

      res.status(HttpStatus.OK).send(Buffer.from(pdfBytes));
    } catch (error) {
      next(error);
    }
  };
}
