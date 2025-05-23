import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import * as dotenv from "dotenv";

// Đọc biến môi trường từ file .env
dotenv.config();

// Kiểm tra và log biến môi trường
const apiKey = process.env.VITE_GEMINI_API_KEY;
console.log('API Key status:', apiKey ? 'Đã tìm thấy' : 'Không tìm thấy');

// Copy biến VITE_GEMINI_API_KEY sang GEMINI_API_KEY để tương thích
process.env.GEMINI_API_KEY = apiKey;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  
  // Kiểm tra xem đang chạy trên Windows hay không
  const isWindows = process.platform === 'win32';
  
  // Sử dụng 'localhost' thay vì '0.0.0.0' cho Windows
  const host = isWindows ? 'localhost' : '0.0.0.0';
  
  // Không sử dụng reusePort trên Windows vì không được hỗ trợ
  const options = isWindows 
    ? { port, host }
    : { port, host, reusePort: true };
  
  server.listen(options, () => {
    log(`serving on ${host}:${port}`);
  });
})();
