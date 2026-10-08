// ============================================================
// MansaRent — API backend (Express + Prisma + PostgreSQL)
// Démarrage : cp .env.example .env → renseignez vos clés
//   → npm install → npx prisma db push → npm run seed → npm run dev
// ============================================================
import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import propertyRoutes from "./routes/properties.js";
import favoriteRoutes from "./routes/favorites.js";
import conversationRoutes from "./routes/conversations.js";
import reviewRoutes from "./routes/reviews.js";
import agentRoutes from "./routes/agents.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import webhookRoutes from "./routes/webhooks.js";
import adminRoutes from "./routes/admin.js";

const app = express();
app.use(cors({ origin: process.env.APP_URL?.split(",") || true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true })); // certains webhooks PSP postent en form-url-encoded

// ---- Santé -------------------------------------------------
app.get("/api/health", (_req, res) => res.json({ ok: true, service: "mansarent-backend" }));

// ---- Routes ------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/admin", adminRoutes);

// ---- 404 ---------------------------------------------------
app.use("/api", (_req, res) => res.status(404).json({ error: "Route introuvable" }));

// ---- Erreurs ------------------------------------------------
 // eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Erreur interne" });
});

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => console.log(`MansaRent backend → http://localhost:${PORT}`));
