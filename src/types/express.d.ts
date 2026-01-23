import type { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      pdf_session_id?: string;
      pdf?: File;
    }
  }
}
