// MTN MoMo — produit Collections (request-to-pay).
// Docs : https://momodeveloper.mtn.com
// Flux : token OAuth -> requesttopay (push sur le téléphone) -> GET statut.
const BASE = process.env.MOMO_BASE || "https://sandbox.momodeveloper.mtn.com";
const TARGET = process.env.MOMO_TARGET_ENV || "sandbox"; // "sandbox" puis votre marché en production
const CURRENCY = process.env.MOMO_CURRENCY || "EUR";     // EUR en sandbox ; GNF en production

async function token() {
  const basic = Buffer.from(`${process.env.MOMO_API_USER}:${process.env.MOMO_API_KEY}`).toString("base64");
  const r = await fetch(`${BASE}/collection/token/`, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Ocp-Apim-Subscription-Key": process.env.MOMO_SUBSCRIPTION_KEY },
  });
  const j = await r.json();
  if (!j.access_token) throw new Error("MTN MoMo: échec de l'obtention du token");
  return j.access_token;
}

export async function initiate({ reference, amount, phone, callbackUrl }) {
  const t = await token();
  const r = await fetch(`${BASE}/collection/v1_0/requesttopay`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${t}`,
      "X-Reference-Id": reference, // UUID = identifiant de la transaction
      "X-Target-Environment": TARGET,
      "Ocp-Apim-Subscription-Key": process.env.MOMO_SUBSCRIPTION_KEY,
      "Content-Type": "application/json",
      ...(callbackUrl ? { "X-Callback-Url": callbackUrl } : {}),
    },
    body: JSON.stringify({
      amount: String(amount),
      currency: CURRENCY,
      externalId: reference,
      payer: { partyIdType: "MSISDN", partyId: (phone || "").replace(/[^0-9]/g, "") },
      payerMessage: "Abonnement MansaRent Pro",
      payeeNote: "MansaRent Pro",
    }),
  });
  if (r.status !== 202) {
    const txt = await r.text().catch(() => "");
    throw new Error(`MTN MoMo: requesttopay ${r.status} ${txt}`);
  }
  return { mode: "poll", providerRef: reference };
}

export async function check(reference) {
  const t = await token();
  const r = await fetch(`${BASE}/collection/v1_0/requesttopay/${reference}`, {
    headers: { Authorization: `Bearer ${t}`, "X-Target-Environment": TARGET, "Ocp-Apim-Subscription-Key": process.env.MOMO_SUBSCRIPTION_KEY },
  });
  const j = await r.json();
  const s = (j.status || "").toUpperCase(); // PENDING | SUCCESSFUL | FAILED
  return { status: s === "SUCCESSFUL" ? "success" : s === "FAILED" ? "failed" : "pending", raw: j };
}
