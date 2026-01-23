import { NextFunction, Request, Response } from "express";

export default interface IPdfController {
  uploadPdf: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
