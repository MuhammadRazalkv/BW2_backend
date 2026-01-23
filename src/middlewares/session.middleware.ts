import { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";
const sessionHandler = (req: Request, res: Response, next: NextFunction) => {
  let pdf_session_id = req.cookies.pdf_session_id;
  if (!pdf_session_id) {
    const uuid = randomUUID();
    res.cookie("pdf_session_id", uuid, {
      maxAge: 86400000, // Expires after 24 hours (in milliseconds)
      httpOnly: true, // Makes the cookie inaccessible to client-side JavaScript (enhances security)
      secure: process.env.NODE_ENV === "production", // Set to true if using HTTPS (for local development, use false)
      sameSite: "lax", // Controls when the cookie is sent with cross-site requests
    });
    pdf_session_id = uuid;
  }
  req.pdf_session_id = pdf_session_id;
  next();
};
export default sessionHandler;
