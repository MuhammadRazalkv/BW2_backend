import { Router } from "express";
import PdfController from "../controller/pdf.controller";
import PdfService from "../services/pdf.service";
import multer from "multer";
import { validatePdfUpload } from "../middlewares/validate.pdf.middleware";

const pdfRoute = Router();
const upload = multer({
  storage: multer.memoryStorage(),
});
const pdfService = new PdfService();
const pdfController = new PdfController(pdfService);

pdfRoute.post(
  "/upload",
  upload.single("pdf"),
  validatePdfUpload,
  pdfController.uploadPdf,
);

export default pdfRoute;
