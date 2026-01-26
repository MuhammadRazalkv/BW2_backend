import { randomUUID } from "node:crypto";
import IPdfService from "./interface/pdf.service.interface";
import { PDFDocument } from "pdf-lib";
// import fs from "fs";
import { AppError } from "../utils/app.error";
import { HttpStatus } from "../constants/statusCodes";
import { messages } from "../constants/httpMessages";
import fs from "fs/promises";
import path from "node:path";

type MetaData = {
  pdfId: string;
  originalName: string;
  pageCount: number;
  uploadedAt: number;
  expiresAt: number;
  size: number;
};
type PdfIndex = {
  pdfs: MetaData[];
};

export default class PdfService implements IPdfService {
  savePdf = async (
    sessionId: string,
    data: {
      buffer: Buffer;
      originalName: string;
      mimeType: string;
      size: number;
    },
  ) => {
    const pdfId = randomUUID();
    const now = Date.now();

    const basePath = path.join(process.cwd(), "storage", "sessions");
    const sessionPath = path.join(basePath, sessionId);
    const pdfPath = path.join(sessionPath, "pdfs", pdfId);
    const indexPath = path.join(sessionPath, "index.json");
    const tempPath = path.join(sessionPath, "index.tmp.json");
    try {
      // Loading PDF
      let pdfDoc: PDFDocument;
      try {
        pdfDoc = await PDFDocument.load(data.buffer, {
          updateMetadata: false,
        });
      } catch {
        throw new AppError(
          HttpStatus.UNPROCESSABLE_ENTITY,
          messages.ENCRYPTED_FILE,
        );
      }

      // Prepare metadata
      const meta = {
        pdfId,
        originalName: data.originalName,
        pageCount: pdfDoc.getPageCount(),
        uploadedAt: now,
        expiresAt: now + 24 * 60 * 60 * 1000, // 24h
        size: data.size,
      };

      // Create directory structure
      await fs.mkdir(pdfPath, { recursive: true });

      // Write files
      await fs.writeFile(path.join(pdfPath, "original.pdf"), data.buffer);

      await fs.writeFile(
        path.join(pdfPath, "meta.json"),
        JSON.stringify(meta, null, 2),
      );

      let index: PdfIndex = { pdfs: [] };
      try {
        const content = await fs.readFile(indexPath, "utf-8");
        index = JSON.parse(content);
      } catch {
        // file does not exist → first upload
      }
      index.pdfs.push(meta);
      await fs.writeFile(tempPath, JSON.stringify(index, null, 2));
      await fs.rename(tempPath, indexPath);
      
      return pdfId;
    } catch (error) {
      // Cleanup on failure (important)
      try {
        await fs.rm(pdfPath, { recursive: true, force: true });
      } catch {
        /* ignore cleanup errors */
      }

      throw error instanceof AppError
        ? error
        : new AppError(HttpStatus.INTERNAL_SERVER_ERROR, messages.SERVER_ERROR);
    }
  };
}
