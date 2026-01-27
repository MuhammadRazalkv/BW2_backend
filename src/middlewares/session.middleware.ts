import { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";
const SESSION_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

const cookieOptions = {
  maxAge: SESSION_MAX_AGE,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};

const sessionHandler = (req: Request, res: Response, next: NextFunction) => {
  let sessionId = req.cookies.pdf_session_id;

  // Optional: validate UUID format
  if (!sessionId) {
    sessionId = randomUUID();
  }

  // Sliding expiration
  res.cookie("pdf_session_id", sessionId, cookieOptions);

  req.pdf_session_id = sessionId;
  next();
};

export default sessionHandler;
