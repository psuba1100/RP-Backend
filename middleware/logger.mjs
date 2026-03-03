import fs from "fs";
import path from "path";

/**
 * Logs an error to console and to a file
 * @param {Error} err - the error object
 * @param {Request} req - Express request object
 */
export function logError(err, req) {
  const logFile = path.join(process.cwd(), "logs", "error.log"); // logs go into project root
  const timestamp = new Date().toISOString();

  // get client IP (Cloudflare-aware)
  const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.connection.remoteAddress;

  const method = req.method;
  const url = req.originalUrl;
  const userAgent = req.headers["user-agent"];

  const logEntry = `
[${timestamp}] Error: ${err.message}
Stack: ${err.stack}
IP: ${ip}
Method: ${method}
URL: ${url}
User-Agent: ${userAgent}
-----------------------
`;

  // append to file
  fs.appendFile(logFile, logEntry, (fsErr) => {
    if (fsErr) console.error("Failed to write error log:", fsErr);
  });

  // also log to console
  console.error(err);
}
