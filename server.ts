import express from "express";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);
  const HOST = process.env.HOST || "0.0.0.0";

  // Trust reverse proxy (Hack Club Nest / Caddy)
  app.set("trust proxy", true);

  // Middleware
  app.use(express.json());

  // Health check endpoint — useful for verifying the server is alive
  app.get("/api/status", (_req, res) => {
    res.json({ status: "ok", message: "JFY-SH Backend Operational", uptime: process.uptime() });
  });

  // Determine if running in production
  const isProd = process.env.NODE_ENV === "production" || __filename.endsWith("server.cjs");

  if (!isProd) {
    // Development: dynamically import Vite (not needed in production)
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve the built static files
    const distPath = path.join(__dirname);
    app.use(express.static(distPath, { maxAge: "1d" }));
    // Support React Router: send all non-API requests to index.html
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api")) return res.status(404).json({ error: "Not found" });
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`✅ Server running in ${isProd ? "PRODUCTION" : "DEVELOPMENT"} mode`);
    console.log(`🌐 Listening on http://${HOST}:${PORT}`);
    console.log(`📡 Test: curl http://localhost:${PORT}/api/status`);
  });
}

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});

