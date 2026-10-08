// ============================================================
// MansaRent — Webhooks des fournisseurs de paiement
// SOURCE DE VÉRITÉ : seul le webhook (ou le polling du statut)
// active l'abonnement. Jamais le retour navigateur.
// ============================================================
import { Router } from "express";
import { prisma } from "../lib/db.js";
import { activateSubscription } from "./subscriptions.js";
import * as cinetpay from "../lib/providers/cinetpay.js";
import * as orange from "../lib/providers/orange.js";
import * as mtnmomo from "../lib/providers/mtnmomo.js";
import * as hub2 from "../lib/providers/hub2.js";

const router = Router();

async function confirm(provider, payment, checkResult) {
  if (!payment) return;
  if (checkResult.status === "success" && payment.status !== "success") {
    await prisma.payment.update({ where: { reference: payment.reference }, data: { status: "success" } });
    await activateSubscription(payment.userId, provider);
  } else if (checkResult.status === "failed" && payment.status === "pending") {
    await prisma.payment.update({ where: { reference: payment.reference }, data: { status: "failed" } });
  }
}

router.post("/cinetpay", async (req, res) => {
  try {
    const ref = req.body?.cpm_trans_id || req.body?.transaction_id;
    const p = ref && (await prisma.payment.findUnique({ where: { reference: ref } }));
    if (p) await confirm("cinetpay", p, await cinetpay.check(ref));
  } catch (e) {
    console.warn("[webhook:cinetpay]", e.message);
  }
  res.sendStatus(200);
});

router.post("/orange", async (req, res) => {
  try {
    const ref = req.body?.order_id;
    const p = ref && (await prisma.payment.findUnique({ where: { reference: ref } }));
    if (p) await confirm("orange", p, await orange.check({ reference: ref, amount: p.amount, payToken: p.providerRef }));
  } catch (e) {
    console.warn("[webhook:orange]", e.message);
  }
  res.sendStatus(200);
});

router.post("/mtnmomo", async (req, res) => {
  try {
    const ref = req.body?.externalId || req.body?.referenceId;
    const p = ref && (await prisma.payment.findUnique({ where: { reference: ref } }));
    if (p) await confirm("mtnmomo", p, await mtnmomo.check(ref));
  } catch (e) {
    console.warn("[webhook:mtnmomo]", e.message);
  }
  res.sendStatus(200);
});

router.post("/hub2", async (req, res) => {
  try {
    const intentId = req.body?.intentId || req.body?.id;
    const p = intentId && (await prisma.payment.findFirst({ where: { providerRef: intentId } }));
    if (p) await confirm("hub2", p, await hub2.check(intentId));
  } catch (e) {
    console.warn("[webhook:hub2]", e.message);
  }
  res.sendStatus(200);
});

export default router;
