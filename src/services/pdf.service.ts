import { randomUUID } from "node:crypto";
import IPdfService from "./interface/pdf.service.interface";
import { PDFDocument } from "pdf-lib";
import { AppError } from "../utils/app.error.js";
import { HttpStatus } from "../constants/statusCodes.js";
import { messages } from "../constants/httpMessages.js";
import { supabase } from "../config/supabase.js";
import { getFromRedis, setToRedis } from "../utils/redis.utils.js";

export type MetaData = {
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
    const sessionPath = `sessions/${sessionId}`;
    const storagePrefix = `${sessionPath}/pdfs/${pdfId}`;
    const originalPdfPath = `${storagePrefix}/original.pdf`;
    const metaPath = `${storagePrefix}/meta.json`;

    let pdfDoc: PDFDocument;

    try {
      //  Validate PDF (same as before)
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

      const meta = {
        pdfId,
        sessionId,
        originalName: data.originalName,
        pageCount: pdfDoc.getPageCount(),
        uploadedAt: now,
        expiresAt: now + 24 * 60 * 60 * 1000,
        size: data.size,
        storagePrefix,
      };

      //  Upload original PDF
      const { error: pdfError } = await supabase.storage
        .from("pdfs")
        .upload(originalPdfPath, data.buffer, {
          contentType: data.mimeType,
          upsert: false,
        });

      if (pdfError) throw pdfError;

      //  Upload metadata JSON
      const { error: metaError } = await supabase.storage
        .from("pdfs")
        .upload(metaPath, Buffer.from(JSON.stringify(meta, null, 2)), {
          contentType: "application/json",
          upsert: false,
        });

      if (metaError) throw metaError;

      let sessionData: PdfIndex = { pdfs: [] };
      let indexContent = await getFromRedis(`session:${sessionId}`);
      if (indexContent) {
        sessionData = JSON.parse(indexContent);
      }
      sessionData.pdfs.push(meta);
      await setToRedis(`session:${sessionId}`, JSON.stringify(sessionData));
      await setToRedis(pdfId, String(now + 24 * 60 * 60 * 1000));

      return pdfId;
    } catch (error) {
      try {
        await supabase.storage.from("pdfs").remove([originalPdfPath, metaPath]);
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
    try {
      const storagePrefix = `sessions/${sessionId}/pdfs/${pdfId}`;
      const originalPdfPath = `${storagePrefix}/original.pdf`;

      const exp = await getFromRedis(pdfId);
      if (!exp || Date.now() > parseInt(exp)) {
        throw new AppError(HttpStatus.GONE, messages.CONTENT_EXPIRED);
      }
      // console.log(
      //   "Using service role:",
      //   process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith("eyJ"),
      // );
      // console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
      // const { data: list, error: listError } = await supabase.storage
      //   .from("pdfs")
      //   .list(`sessions/${sessionId}/pdfs/${pdfId}`);

      // console.log("LIST:", list, listError);
      // const { data, error } = await supabase.storage
      //   .from("pdfs")
      //   .download(originalPdfPath);

      // if (error || !data) {
      //   console.error("Error from accessing files", error);

      //   throw new AppError(
      //     HttpStatus.INTERNAL_SERVER_ERROR,
      //     messages.FAILED_TO_ACCESS_PDF,
      //   );
      // }

      const publicUrl =
        `${process.env.SUPABASE_URL}/storage/v1/object/public/` +
        `pdfs/${originalPdfPath}`;

      const res = await fetch(publicUrl);
      if (!res.ok) {
        throw new AppError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          messages.FAILED_TO_ACCESS_PDF,
        );
      }

      //  Load PDF document
      const originalPdfDoc = await PDFDocument.load(await res.arrayBuffer());

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

  pdfHistory = async (sessionId: string) => {
    let index: PdfIndex = { pdfs: [] };
    let rawData = await getFromRedis(`session:${sessionId}`);
    if (rawData) {
      index = JSON.parse(rawData);
    }
    const metadata = index.pdfs.filter((item) => Date.now() < item.expiresAt);
    return metadata.reverse();
  };

  getPdf = async (sessionId: string, pdfId: string) => {
    let index: PdfIndex = { pdfs: [] };

    const sessionPath = `sessions/${sessionId}`;
    const storagePrefix = `${sessionPath}/pdfs/${pdfId}`;
    const originalPdfPath = `${storagePrefix}/original.pdf`;
    let rawData = await getFromRedis(`session:${sessionId}`);
    if (rawData) {
      index = JSON.parse(rawData);
    }

    const found = index.pdfs.find((p) => p.pdfId === pdfId);
    if (!found) {
      throw new AppError(HttpStatus.NOT_FOUND, messages.NOT_FOUND);
    }

    //  Validate expiration
    if (Date.now() > found.expiresAt) {
      throw new AppError(HttpStatus.GONE, messages.CONTENT_EXPIRED);
    }

    const publicUrl =
      `${process.env.SUPABASE_URL}/storage/v1/object/public/` +
      `pdfs/${originalPdfPath}`;

    const res = await fetch(publicUrl);
    if (!res.ok) {
      throw new AppError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        messages.FAILED_TO_ACCESS_PDF,
      );
    }

    // const originalPdfDoc = await PDFDocument.load(await res.arrayBuffer());

    // const { data, error } = await supabase.storage
    //   .from("pdfs")
    //   .download(originalPdfPath);

    // if (error || !data) {
    //   throw new AppError(
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //     messages.FAILED_TO_ACCESS_PDF,
    //   );
    // }

    const buffer = await res.arrayBuffer();
    return new Uint8Array(buffer);
  };
}
