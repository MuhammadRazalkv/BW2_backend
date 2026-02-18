# 📄 PDFslice Backend

PDFslice Backend is the server-side application responsible for handling PDF uploads, extracting and processing PDF data, managing session/history using Redis, and serving APIs for the PDFslice platform.

---

## 🚀 Features
- Upload PDF files
- Parse and process PDF documents
- Extract structured data from PDFs
- Store temporary session/history data using Redis
- Background cleanup of temporary files
- Centralized error handling

---

## 🛠 Tech Stack & Libraries

### Core
- **Node.js**
- **Express.js**
- **TypeScript**

### File & PDF Handling
- **multer** – handling PDF uploads
- **pdf-lib** – PDF parsing and manipulation

### Caching / Storage
- **Redis** – session & history storage

### Utilities & Middleware
- **dotenv** – environment variables
- **cors** – cross-origin requests
- **express-rate-limit** – rate limiting
- **uuid** – unique identifiers

### Development
- **ts-node**
- **nodemon**
- **eslint**

---
## ⚙️ Environment Variables
Create a `.env` file in the root directory:
PORT=5000
REDIS_URL=redisurl 
SUPABASE_URL:supabase-url
SUPABASE_SERVICE_ROLE_KEY:'SUPABASE_SERVICE_ROLE_KEY'
NODE_ENV=development
FRONT_END_URL


--- 
## Front end : https://github.com/MuhammadRazalkv/BW2_frontend
