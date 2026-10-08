// ============================================================
// MansaRent — Routes d'authentification
// Email/password (bcrypt + JWT) + Google OAuth (vérifié côté serveur)
// Les tables User/Account/Session sont compatibles Better Auth.
// ============================================================
import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../lib/db.js";
import { signToken } from "../lib/auth.js";
import { requireAuth, sanitize } from "../middleware/auth.js";
import { Mailer } from "../lib/email.js";

const router = Router();
const DAY = 86400000;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "");

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(160),
  password: z.string().min(6).max(128),
  role: z.enum(["tenant", "landlord", "agent"]).optional().default("tenant"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ---- Inscription -------------------------------------------
router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Données invalides" });
  const { name, email, password, role } = parsed.data;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Cet e-mail est déjà utilisé" });
    const hash = await bcrypt.hash(password, 10);
    const trialEndsAt = new Date(Date.now() + 30 * DAY);
    const user = await prisma.user.create({
      data: { name, email, password: hash, role, trialEndsAt },
    });
    // E-mail de bienvenue (non bloquant)
    Mailer.welcome(email, name).catch((e) => console.warn("[mail]", e.message));
    const token = signToken(user);
    res.status(201).json({ user: sanitize(user), token, trialEndsAt });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Inscription impossible" });
  }
});

// ---- Connexion ----------------------------------------------
router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Données invalides" });
  const { email, password } = parsed.data;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.password) return res.status(401).json({ error: "Identifiants invalides" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Identifiants invalides" });
    const token = signToken(user);
    res.json({ user: sanitize(user), token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Connexion impossible" });
  }
});

// ---- Google Sign-In (ID token vérifié côté serveur) ---------
router.post("/google", async (req, res) => {
  const { credential } = req.body || {};
  if (!credential) return res.status(400).json({ error: "credential requis" });
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub, email, name, picture } = ticket.getPayload();
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name || email.split("@")[0],
          email,
          googleId: sub,
          avatar: picture || null,
          emailVerified: true,
          trialEndsAt: new Date(Date.now() + 30 * DAY),
        },
      });
      Mailer.welcome(email, user.name).catch((e) => console.warn("[mail]", e.message));
    } else if (!user.googleId) {
      user = await prisma.user.update({ where: { id: user.id }, data: { googleId: sub } });
    }
    const token = signToken(user);
    res.json({ user: sanitize(user), token });
  } catch (e) {
    console.error(e);
    res.status(401).json({ error: "Token Google invalide" });
  }
});

// ---- Utilisateur courant ------------------------------------
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: sanitize(req.user) });
});

// ---- Mot de passe oublié -----------------------------------
const resetTokens = new Map(); // token -> { userId, expires } (remplacer par Redis/DB en prod)

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "E-mail requis" });
  const user = await prisma.user.findUnique({ where: { email } });
  // Réponse identique que l'utilisateur existe ou non (anti-énumération)
  if (user) {
    const token = jwt.sign(
      { sub: user.id, purpose: "reset" },
      process.env.JWT_SECRET || "mansarent-dev-secret",
      { expiresIn: "1h" }
    );
    resetTokens.set(token, { userId: user.id, expires: Date.now() + 3600000 });
    const link = `${process.env.APP_URL || "http://localhost:5173"}/reset-password?token=${token}`;
    Mailer.passwordReset(email, link).catch((e) => console.warn("[mail]", e.message));
  }
  res.json({ ok: true });
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password || password.length < 6) {
    return res.status(400).json({ error: "Token et mot de passe (6+ caractères) requis" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "mansarent-dev-secret");
    if (payload.purpose !== "reset") throw new Error("bad purpose");
    const entry = resetTokens.get(token);
    if (!entry || entry.expires < Date.now()) {
      return res.status(400).json({ error: "Lien expiré ou invalide" });
    }
    const hash = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: entry.userId }, data: { password: hash } });
    resetTokens.delete(token);
    res.json({ ok: true });
  } catch {
    res.status(400).json({ error: "Lien expiré ou invalide" });
  }
});

export default router;
