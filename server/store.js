// Stockage en mémoire (démo). Remplacez par votre base de données.
const payments = new Map();      // reference -> { reference, userId, provider, providerRef, status, amount }
const subscriptions = new Map(); // userId    -> { plan, method, subscribedUntil }

const DAY = 86400000;

export const Store = {
  putPayment(p) { payments.set(p.reference, p); return p; },
  getPayment(ref) { return payments.get(ref) || null; },
  updatePayment(ref, patch) { const p = payments.get(ref); if (p) Object.assign(p, patch); return p || null; },
  findByProviderRef(providerRef) {
    for (const p of payments.values()) if (p.providerRef === providerRef) return p;
    return null;
  },
  activateSubscription(userId, method) {
    const sub = { plan: "Pro", method, subscribedUntil: Date.now() + 30 * DAY };
    subscriptions.set(userId, sub);
    return sub;
  },
  getSubscription(userId) { return subscriptions.get(userId) || null; },
};
