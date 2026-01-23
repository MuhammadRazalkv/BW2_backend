import { Request, Response, NextFunction } from "express";

export const validateExtractRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { pdfId, pages } = req.body;

  // 1️⃣ pdfId
  if (!pdfId || typeof pdfId !== "string") {
    return res.status(400).json({ message: "Invalid or missing pdfId" });
  }

  // 2️⃣ pages array
  if (!Array.isArray(pages) || pages.length === 0) {
    return res.status(400).json({
      message: "Pages must be a non-empty array",
    });
  }

  // 3️⃣ Validate page numbers
  for (const page of pages) {
    if (!Number.isInteger(page) || page < 1) {
      return res.status(400).json({
        message: "Page numbers must be integers greater than 0",
      });
    }
  }

  // 4️⃣ No duplicates
  const uniquePages = new Set(pages);
  if (uniquePages.size !== pages.length) {
    return res.status(400).json({
      message: "Duplicate page numbers are not allowed",
    });
  }

  next();
};
