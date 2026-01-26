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

  downloadPdf = async (
    sessionId: string,
    pdfId: string,
    pages: number[],
  ): Promise<Uint8Array> => {
    let index: PdfIndex = { pdfs: [] };

    try {
      //  Resolve paths
      const basePath = path.join(process.cwd(), "storage", "sessions");
      const sessionPath = path.join(basePath, sessionId);
      const pdfFolderPath = path.join(sessionPath, "pdfs", pdfId);
      const indexPath = path.join(sessionPath, "index.json");
      const originalPdfPath = path.join(pdfFolderPath, "original.pdf");

      //  Load index.json
      const indexContent = await fs.readFile(indexPath, "utf-8");
      index = JSON.parse(indexContent) as PdfIndex;

      //  Validate pdf existence
      const found = index.pdfs.find((p) => p.pdfId === pdfId);
      if (!found) {
        throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
      }

      //  Validate expiration
      if (Date.now() > found.expiresAt) {
        throw new AppError(HttpStatus.GONE, messages.CONTENT_EXPIRED);
      }

      //  Read original PDF
      const originalPdfBytes = await fs.readFile(originalPdfPath);

      //  Load PDF document
      const originalPdfDoc = await PDFDocument.load(originalPdfBytes);
      const totalPages = originalPdfDoc.getPageCount();

      //  Validate requested pages
      for (const page of pages) {
        if (!Number.isInteger(page) || page < 1 || page > totalPages) {
          throw new AppError(
            HttpStatus.BAD_REQUEST,
            messages.INVALID_PAGE_NUMBER,
          );
        }
      }

      //  Create new PDF
      const newPdfDoc = await PDFDocument.create();
      const pageIndices = pages.map((p) => p - 1);

      const copiedPages = await newPdfDoc.copyPages(
        originalPdfDoc,
        pageIndices,
      );

      for (const page of copiedPages) {
        newPdfDoc.addPage(page);
      }

      //  Generate final PDF bytes
      const pdfBytes = await newPdfDoc.save();

      return pdfBytes;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        messages.SERVER_ERROR,
      );
    }
  };
}
