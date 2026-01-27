import { MetaData } from "../pdf.service";

type UploadedPdf = {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
};

export default interface IPdfService {
  savePdf: (sessionId: string, data: UploadedPdf) => Promise<string>;
  downloadPdf: (
    sessionId: string,
    pdfId: string,
    pages: number[],
  ) => Promise<Uint8Array<ArrayBufferLike>>;
  pdfHistory: (sessionId: string) => Promise<MetaData[]>;
  getPdf: (
    sessionId: string,
    pdfId: string,
  ) => Promise<Uint8Array<ArrayBufferLike>>;
}
