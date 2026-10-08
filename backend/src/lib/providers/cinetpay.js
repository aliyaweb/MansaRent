// CinetPay — agrégateur (Orange Money GN, MTN MoMo GN, Visa/Mastercard).
// Docs : https://docs.cinetpay.com (API Checkout v2)
const BASE = process.env.CINETPAY_BASE || "https://api-checkout.cinetpay.com/v2";
const CURRENCY = process.env.CINETPAY_CURRENCY || "GNF";

export async function initiate({ reference, amount, method, customer, returnUrl, notifyUrl }) {
  const channels = method === "card" ? "CREDIT_CARD" : (method === "orange" || method === "momo") ? "MOBILE_MONEY" : "ALL";
  const body = {
    apikey: process.env.CINETPAY_API_KEY,
    site_id: process.env.CINETPAY_SITE_ID,
    transaction_id: reference,
    amount,
    currency: CURRENCY,
    description: "Abonnement MansaRent Pro",
    channels,
    return_url: returnUrl,
    notify_url: notifyUrl,
    lang: "fr",
    metadata: reference,
    customer_id: customer?.id || "anon",
    customer_name: customer?.name || "Client",
    customer_surname: customer?.surname || "MansaRent",
    customer_email: customer?.email || "client@mansarent.gn",
    customer_phone_number: customer?.phone || "",
    customer_address: "Conakry",
    customer_city: "Conakry",
    customer_country: "GN",
    customer_state: "GN",
    customer_zip_code: "00000",
  };
  const r = await fetch(`${BASE}/payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  if (String(j?.code) !== "201") throw new Error(`CinetPay: ${j?.message || j?.description || "échec d'initialisation"}`);
  return { redirectUrl: j.data.payment_url, providerRef: j.data.payment_token };
}

export async function check(reference) {
  const r = await fetch(`${BASE}/payment/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transaction_id: reference, site_id: process.env.CINETPAY_SITE_ID, apikey: process.env.CINETPAY_API_KEY }),
  });
  const j = await r.json();
  const status = j?.data?.status; // ACCEPTED | REFUSED | WAITING_FOR_CUSTOMER | ...
  return { status: status === "ACCEPTED" ? "success" : status === "REFUSED" ? "failed" : "pending", raw: j };
}
