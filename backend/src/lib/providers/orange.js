// Orange Money — Web Payment (Orange Developer).
// Docs : https://developer.orange.com/apis/om-webpay
// Flux : token OAuth -> webpayment (renvoie payment_url) -> transactionstatus.
const TOKEN_URL = process.env.OM_TOKEN_URL || "https://api.orange.com/oauth/v3/token";
const BASE = process.env.OM_BASE || "https://api.orange.com";
// Chemin pays : "dev" en sandbox ; valeur pays en production (selon votre contrat Orange Guinée).
const PATH = process.env.OM_WEBPAY_PATH || "dev";
const CURRENCY = process.env.OM_CURRENCY || "OUV"; // OUV = sandbox ; GNF en production

async function token() {
  // OM_AUTH_BASIC = base64("consumer_key:consumer_secret") (en-tête « Authorization: Basic ... » fourni par Orange).
  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${process.env.OM_AUTH_BASIC}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: "grant_type=client_credentials",
  });
  const j = await r.json();
  if (!j.access_token) throw new Error("Orange Money: échec de l'obtention du token");
  return j.access_token;
}

export async function initiate({ reference, amount, returnUrl, cancelUrl, notifyUrl }) {
  const t = await token();
  const r = await fetch(`${BASE}/orange-money-webpay/${PATH}/v1/webpayment`, {
    method: "POST",
    headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      merchant_key: process.env.OM_MERCHANT_KEY,
      currency: CURRENCY,
      order_id: reference,
      amount,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notif_url: notifyUrl,
      lang: "fr",
      reference: "MansaRent",
    }),
  });
  const j = await r.json();
  if (!j.payment_url) throw new Error(`Orange Money: ${j.message || "échec d'initialisation"}`);
  return { redirectUrl: j.payment_url, providerRef: j.pay_token, notifToken: j.notif_token };
}

export async function check({ reference, amount, payToken }) {
  const t = await token();
  const r = await fetch(`${BASE}/orange-money-webpay/${PATH}/v1/transactionstatus`, {
    method: "POST",
    headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ order_id: reference, amount, pay_token: payToken }),
  });
  const j = await r.json();
  const s = (j.status || "").toUpperCase(); // INITIATED | PENDING | EXPIRED | SUCCESS | FAILED
  return { status: s === "SUCCESS" ? "success" : ["FAILED", "EXPIRED"].includes(s) ? "failed" : "pending", raw: j };
}
