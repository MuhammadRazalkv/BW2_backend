type UploadedPdf = {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
};

export default interface IPdfService {
  savePdf: (sessionId: string, data: UploadedPdf) => Promise<string>;
}
