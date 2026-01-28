import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pdfRoute from "./routes/pdf.routes.js";
import { rateLimit } from "express-rate-limit";
import errorHandler from "./middlewares/error.middleware.js";
import sessionHandler from "./middlewares/session.middleware.js";

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 15 minutes
  limit: 50, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(limiter);
app.use(sessionHandler);
app.use("/pdf", pdfRoute);
app.use(errorHandler);

export default app;
