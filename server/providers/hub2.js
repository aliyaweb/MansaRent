// Hub2 — agrégateur PayIn (mobile money + carte) couvrant la Guinée.
// Docs : https://docs.hub2.io
// Flux : créer un payment-intent -> créer un payment (OTP mobile money) -> poll du statut.
const BASE = process.env.HUB2_BASE || "https://api.hub2.io";
const CURRENCY = process.env.HUB2_CURRENCY || "GNF";
const COUNTRY = process.env.HUB2_COUNTRY || "GN";

function headers() {
  return {
    "Content-Type": "application/json",
    ApiKey: process.env.HUB2_API_KEY,
    MerchantId: process.env.HUB2_MERCHANT_ID,
    Environment: process.env.HUB2_ENV || "sandbox",
  };
}

export async function initiate({ reference, amount, method, provider, phone, otp, customer }) {
  // 1) Intention de paiement
  const r1 = await fetch(`${BASE}/payment-intents`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ customerReference: customer?.id || reference, purchaseReference: reference, amount, currency: CURRENCY }),
  });
  const intent = await r1.json();
  if (!intent.id || !intent.token) throw new Error(`Hub2: échec de l'intention (${intent.message || r1.status})`);

  // 2) Paiement associé à l'intention.
  //    Mobile money = OTP requis (Orange) ou push (MTN). Carte = via le SDK client Hub2 (PCI), non géré ici.
  const payBody = {
    token: intent.token,
    paymentMethod: method === "card" ? "card" : "mobile_money",
    country: COUNTRY,
    provider: provider || (method === "momo" ? "mtn" : "orange"),
    mobileMoney: { msisdn: (phone || "").replace(/[^0-9]/g, ""), otp: otp || "" },
  };
  const r2 = await fetch(`${BASE}/payment-intents/${intent.id}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payBody),
  });
  const pay = await r2.json();
  return { mode: "poll", providerRef: intent.id, nextAction: pay?.nextAction || null, raw: pay };
}

export async function check(intentId) {
  const r = await fetch(`${BASE}/payment-intents/${intentId}`, { headers: headers() });
  const j = await r.json();
  const payments = j.payments || [];
  const last = payments[payments.length - 1];
  const s = (j.status || last?.status || "").toLowerCase(); // successful | failed | pending
  return { status: s === "successful" ? "success" : s === "failed" ? "failed" : "pending", raw: j };
}
