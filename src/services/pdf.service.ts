import IPdfService from "./interface/pdf.service.interface";

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
    return "";
  };
}
