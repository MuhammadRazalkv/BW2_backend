import { NextFunction, Request, Response } from "express";

export default interface IPdfController {
  uploadPdf: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  extractPdf: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void>;
  listPdf: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  fetchPdf: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
