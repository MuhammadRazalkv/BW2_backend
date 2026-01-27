import { Router } from "express";
import PdfController from "../controller/pdf.controller";
import PdfService from "../services/pdf.service";
import multer from "multer";
import { validatePdfUpload } from "../middlewares/validate.pdf.middleware";
import { validateExtractRequest } from "../middlewares/validate.extract.middleware";
import { validateFetchRequest } from "../middlewares/validate.fetch.middlware";

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
