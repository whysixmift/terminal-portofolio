import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware
  app.use(express.json());

  // API placeholders for the Admin page
  app.get("/api/status", (req, res) => {
    res.json({ status: "ok", message: "JFY-SH Backend Operational" });
  });

  // Vite middleware for development
  const isProd = process.env.NODE_ENV === "production" || __filename.endsWith("server.cjs");
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Support React Router: send all non-API requests to index.html
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) return res.status(404).json({ error: "Not found" });
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
