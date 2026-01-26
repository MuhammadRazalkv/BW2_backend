export const messages = {
  // General
  SERVER_ERROR: "Something went wrong on our end. Please try again later.",
  NOT_FOUND: "The requested resource was not found.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN: "Access to this resource is forbidden.",

  // Validation / Client Errors
  BAD_REQUEST: "Invalid request. Please check your input.",
  CONFLICT: "The resource already exists or there is a conflict.",
  UNPROCESSABLE: "Validation failed. Please check your data.",
  INVALID_PDF: "Invalid or corrupted PDF file",
  PASSWORD_NOT_MATCH: "Incorrect current password. Please try again.",
  NO_FILE_UPLOADED: "No file uploaded",
  SIZE_LIMIT_EXCEEDED: "PDF file size must be less than 10MB",
  NOT_A_PDF_FILE: "Only PDF files are allowed",
  ENCRYPTED_FILE:'This PDF is password-protected and cannot be processed.',
  // Success messages
  CREATED: "Resource created successfully.",
  UPDATED: "Resource updated successfully.",
  DELETED: "Resource deleted successfully.",
  OK: "Request completed successfully.",
  INVALID_ID: "Invalid id provided",
  NOT_BLOCKED: "You haven`t blocked this article",
  // Authentication
  INVALID_TOKEN: "Invalid token provided.",
  TOKEN_NOTFOUND: "Session expired. Please login again.",
  DATABASE_OPERATION_FAILED: "Data base operation failed.",
};
