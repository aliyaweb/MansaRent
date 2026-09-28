// MansaRent — API de paiement (référence).
// Démarrage : cp .env.example .env  →  renseignez vos clés  →  npm install && npm start
//
// IMPORTANT
// - Les clés des fournisseurs vivent UNIQUEMENT ici (jamais dans le frontend).
// - La source de vérité d'un paiement = le webhook du fournisseur (ou le polling du statut),
//   jamais le retour navigateur du client.
// - L'abonnement mobile money n'est pas un prélèvement automatique : à chaque échéance,
//   relancez un paiement (push/USSD) — voir /api/subscriptions/checkout.
import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import "dotenv/config";
import { Store } from "./store.js";
import * as cinetpay from "./providers/cinetpay.js";
import * as orange from "./providers/orange.js";
import * as mtnmomo from "./providers/mtnmomo.js";
import * as hub2 from "./providers/hub2.js";

const app = express();
app.use(cors({ origin: process.env.APP_URL || true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // certains webhooks PSP postent en form-url-encoded

const PRICE = Number(process.env.SUBSCRIPTION_PRICE || 50000);
const PUBLIC_URL = process.env.PUBLIC_URL || "http://localhost:4000"; // URL publique (ngrok/HTTPS) pour les webhooks
const APP_URL = process.env.APP_URL || "http://localhost:5173";
const providers = { cinetpay, orange, mtnmomo, hub2 };

// ---- Lancer un paiement d'abonnement -------------------------------
app.post("/api/subscriptions/checkout", async (req, res) => {
  try {
    const { userId, provider = "cinetpay", method = "orange", phone, otp, customer } = req.body || {};
    if (!userId) return res.status(400).json({ error: "userId requis" });
    if (!providers[provider]) return res.status(400).json({ error: "Fournisseur inconnu" });

    const reference = "MR-" + randomUUID();
    Store.putPayment({ reference, userId, provider, status: "pending", amount: PRICE });

    const returnUrl = `${APP_URL}/?sub=return&ref=${reference}`;
    const notifyUrl = `${PUBLIC_URL}/api/webhooks/${provider}`;

    const result = await providers[provider].initiate({
      reference,
      amount: PRICE,
      method,
      provider: method === "momo" ? "mtn" : "orange", // sous-fournisseur pour Hub2
      phone,
      otp,
      customer,
      returnUrl,
      cancelUrl: returnUrl,
      notifyUrl,
      callbackUrl: notifyUrl,
    });

    Store.updatePayment(reference, { providerRef: result.providerRef, notifToken: result.notifToken });
    res.json({
      reference,
      redirectUrl: result.redirectUrl || null,
      mode: result.mode || (result.redirectUrl ? "redirect" : "poll"),
      nextAction: result.nextAction || null,
    });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// ---- Statut d'un paiement (utilisé par le polling du frontend) -----
app.get("/api/subscriptions/payment/:ref/status", async (req, res) => {
  try {
    const p = Store.getPayment(req.params.ref);
    if (!p) return res.status(404).json({ error: "Paiement introuvable" });

    if (p.status === "pending") {
      const prov = providers[p.provider];
      let r;
      if (p.provider === "orange") r = await prov.check({ reference: p.reference, amount: p.amount, payToken: p.providerRef });
      else if (p.provider === "hub2") r = await prov.check(p.providerRef);
      else r = await prov.check(p.reference);

      if (r.status === "success") {
        Store.updatePayment(p.reference, { status: "success" });
        Store.activateSubscription(p.userId, p.provider);
      } else if (r.status === "failed") {
        Store.updatePayment(p.reference, { status: "failed" });
      }
    }

    const fresh = Store.getPayment(req.params.ref);
    res.json({ status: fresh.status, subscription: Store.getSubscription(fresh.userId) });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// ---- État de l'abonnement d'un utilisateur -------------------------
app.get("/api/subscriptions/:userId", (req, res) => {
  res.json({ subscription: Store.getSubscription(req.params.userId) });
});

// ---- Webhooks (source de vérité) -----------------------------------
async function confirm(provider, payment, checkResult) {
  if (checkResult.status === "success") {
    Store.updatePayment(payment.reference, { status: "success" });
    Store.activateSubscription(payment.userId, provider);
  } else if (checkResult.status === "failed") {
    Store.updatePayment(payment.reference, { status: "failed" });
  }
}

app.post("/api/webhooks/cinetpay", async (req, res) => {
  const ref = req.body?.cpm_trans_id || req.body?.transaction_id;
  const p = ref && Store.getPayment(ref);
  if (p) await confirm("cinetpay", p, await cinetpay.check(ref));
  res.sendStatus(200);
});

app.post("/api/webhooks/orange", async (req, res) => {
  const ref = req.body?.order_id;
  const p = ref && Store.getPayment(ref);
  if (p) await confirm("orange", p, await orange.check({ reference: ref, amount: p.amount, payToken: p.providerRef }));
  res.sendStatus(200);
});

app.post("/api/webhooks/mtnmomo", async (req, res) => {
  const ref = req.body?.externalId || req.body?.referenceId;
  const p = ref && Store.getPayment(ref);
  if (p) await confirm("mtnmomo", p, await mtnmomo.check(ref));
  res.sendStatus(200);
});

app.post("/api/webhooks/hub2", async (req, res) => {
  const intentId = req.body?.intentId || req.body?.id;
  const p = intentId && Store.findByProviderRef(intentId);
  if (p) await confirm("hub2", p, await hub2.check(intentId));
  res.sendStatus(200);
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`MansaRent payments API → http://localhost:${PORT}`));
