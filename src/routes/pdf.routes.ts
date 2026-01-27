import { Router } from "express";
import PdfController from "../controller/pdf.controller.js";
import PdfService from "../services/pdf.service.js";
import multer from "multer";
import { validatePdfUpload } from "../middlewares/validate.pdf.middleware.js";
import { validateExtractRequest } from "../middlewares/validate.extract.middleware.js";
import { validateFetchRequest } from "../middlewares/validate.fetch.middleware.js";

const pdfRoute = Router();
const upload = multer({
  storage: multer.memoryStorage(),
});
const pdfService = new PdfService();
const pdfController = new PdfController(pdfService);

pdfRoute
  .post(
    "/upload",
    upload.single("pdf"),
    validatePdfUpload,
    pdfController.uploadPdf,
  )
  .get("/extract", validateExtractRequest, pdfController.extractPdf)
  .get("/list", pdfController.listPdf)
  .get("/pdf", validateFetchRequest, pdfController.fetchPdf);

export default pdfRoute;
