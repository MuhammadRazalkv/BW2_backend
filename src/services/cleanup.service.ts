// import path from "node:path";
// import fs from "node:fs/promises";
// import { MetaData } from "./pdf.service";

// type PdfIndex = {
//   pdfs: MetaData[];
// };

// async function cleanUpService() {
//   const basePath = path.join(process.cwd(), "storage", "sessions");

//   try {
//     const sessionDirs = await fs.readdir(basePath, { withFileTypes: true });

//     for (const sessionDir of sessionDirs) {
//       if (!sessionDir.isDirectory()) continue;

//       const sessionPath = path.join(basePath, sessionDir.name);
//       const indexPath = path.join(sessionPath, "index.json");
//       const pdfsPath = path.join(sessionPath, "pdfs");

//       let index: PdfIndex;

//       // Read index.json
//       try {
//         const content = await fs.readFile(indexPath, "utf-8");
//         index = JSON.parse(content);
//       } catch (err: any) {
//         if (err.code === "ENOENT") {
//           await fs.rm(sessionPath, { recursive: true, force: true });
//         }
//         continue;
//       }

//       const now = Date.now();
//       const remainingPdfs: PdfIndex["pdfs"] = [];

//       // Process PDFs
//       for (const pdf of index.pdfs) {
//         if (now > pdf.expiresAt) {
//           const pdfFolderPath = path.join(pdfsPath, pdf.pdfId);

//           // Delete expired PDF folder
//           try {
//             await fs.rm(pdfFolderPath, { recursive: true, force: true });
//           } catch {
//             // Ignore deletion errors
//           }
//         } else {
//           remainingPdfs.push(pdf);
//         }
//       }

//       //  Update index.json or delete session folder
//       if (remainingPdfs.length === 0) {
//         await fs.rm(sessionPath, { recursive: true, force: true });
//       } else {
//         await fs.writeFile(
//           indexPath,
//           JSON.stringify({ pdfs: remainingPdfs }, null, 2),
//         );
//       }
//     }
//   } catch (error) {
//     console.error("Cleanup service failed:", error);
//   }
// }

// export default cleanUpService;
