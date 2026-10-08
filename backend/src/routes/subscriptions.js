// ============================================================
// MansaRent — Abonnements (checkout + statut)
// La source de vérité = webhook du fournisseur (voir webhooks.js)
// ou le polling du statut ci-dessous.
// ============================================================
import { Router } from "express";
import { randomUUID } from "crypto";
import { prisma } from "../lib/db.js";
import { requireAuth } from "../middleware/auth.js";
import { Mailer } from "../lib/email.js";
import * as cinetpay from "../lib/providers/cinetpay.js";
import * as orange from "../lib/providers/orange.js";
import * as mtnmomo from "../lib/providers/mtnmomo.js";
import * as hub2 from "../lib/providers/hub2.js";

const router = Router();
const providers = { cinetpay, orange, mtnmomo, hub2 };
const PRICE = Number(process.env.SUBSCRIPTION_PRICE || 50000);
const APP_URL = process.env.APP_URL || "http://localhost:5173";
const PUBLIC_URL = process.env.PUBLIC_URL || "http://localhost:4000";
const DAY = 86400000;

export async function activateSubscription(userId, method) {
  const until = new Date(Date.now() + 30 * DAY);
  await prisma.$transaction([
    prisma.subscription.create({ data: { userId, plan: "Pro", method, subscribedUntil: until } }),
    prisma.user.update({ where: { id: userId }, data: { subscribedUntil: until } }),
  ]);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.email) {
    Mailer.subscriptionConfirmed(user.email, until.toLocaleDateString("fr-FR")).catch(() => {});
  }
  return until;
}

// ---- Lancer un paiement ----------------------------------------
router.post("/checkout", requireAuth, async (req, res) => {
  try {
    const { provider = "cinetpay", method = "orange", phone, otp, customer } = req.body || {};
    if (!providers[provider]) return res.status(400).json({ error: "Fournisseur inconnu" });
    const reference = "MR-" + randomUUID();
    await prisma.payment.create({
      data: { reference, userId: req.user.id, provider, status: "pending", amount: PRICE },
    });
    const returnUrl = `${APP_URL}/?sub=return&ref=${reference}`;
    const notifyUrl = `${PUBLIC_URL}/api/webhooks/${provider}`;
    const result = await providers[provider].initiate({
      reference,
      amount: PRICE,
      method,
      provider: method === "momo" ? "mtn" : "orange",
      phone,
      otp,
      customer,
      returnUrl,
      cancelUrl: returnUrl,
      notifyUrl,
      callbackUrl: notifyUrl,
    });
    await prisma.payment.update({
      where: { reference },
      data: { providerRef: result.providerRef || null, notifToken: result.notifToken || null },
    });
    res.json({
      reference,
      redirectUrl: result.redirectUrl || null,
      mode: result.mode || (result.redirectUrl ? "redirect" : "poll"),
      nextAction: result.nextAction || null,
    });
  } catch (e) {
    console.error(e);
    res.status(502).json({ error: e.message });
  }
});

// ---- Statut d'un paiement (polling frontend) ----------------------
router.get("/payment/:ref/status", requireAuth, async (req, res) => {
  try {
    const p = await prisma.payment.findUnique({ where: { reference: req.params.ref } });
    if (!p) return res.status(404).json({ error: "Paiement introuvable" });
    if (p.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Non autorisé" });
    }
    if (p.status === "pending") {
      try {
        const prov = providers[p.provider];
        let r;
        if (p.provider === "orange") r = await prov.check({ reference: p.reference, amount: p.amount, payToken: p.providerRef });
        else if (p.provider === "hub2") r = await prov.check(p.providerRef);
        else r = await prov.check(p.reference);
        if (r.status === "success") {
          await prisma.payment.update({ where: { reference: p.reference }, data: { status: "success" } });
          await activateSubscription(p.userId, p.provider);
        } else if (r.status === "failed") {
          await prisma.payment.update({ where: { reference: p.reference }, data: { status: "failed" } });
        }
      } catch (e) {
        console.warn("[poll]", e.message);
      }
    }
    const fresh = await prisma.payment.findUnique({ where: { reference: req.params.ref } });
    const sub = await prisma.subscription.findFirst({
      where: { userId: fresh.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ status: fresh.status, subscription: sub });
  } catch (e) {
    console.error(e);
    res.status(502).json({ error: e.message });
  }
});

// ---- État de l'abonnement d'un utilisateur --------------------------
router.get("/:userId", requireAuth, async (req, res) => {
  try {
    if (req.params.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Non autorisé" });
    }
    const sub = await prisma.subscription.findFirst({
      where: { userId: req.params.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ subscription: sub });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Abonnement introuvable" });
  }
});

export default router;
