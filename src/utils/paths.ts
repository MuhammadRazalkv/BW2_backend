export function buildPdfPath(sessionId: string, pdfId: string) {
  return `sessions/${sessionId}/pdfs/${pdfId}/original.pdf`;
}
