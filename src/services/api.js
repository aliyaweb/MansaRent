// ============================================================
// MansaRent — couche service API (à brancher sur votre backend)
// ============================================================
// Définissez VITE_API_URL dans un fichier .env (voir .env.example).
// Par défaut : http://localhost:4000/api
//
// Ces fonctions remplacent l'état en mémoire de MansaRent.jsx :
//   SEED_PROPERTIES  -> PropertyAPI.list()
//   addProperty()    -> PropertyAPI.create()
//   login()/logout() -> AuthAPI.login() / register()
//   toggleFavorite() -> FavoriteAPI.toggle()
// Voir le README pour le détail de l'intégration.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function authHeaders() {
  const token = window.__MR_TOKEN__; // remplacez par votre stockage de token
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function http(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status} : ${message}`);
  }
  return res.status === 204 ? null : res.json();
}

// ---- Propriétés -------------------------------------------------
export const PropertyAPI = {
  // filters: { city, type, rental, beds, minPrice, maxPrice, q, sort }
  list(filters = {}) {
    const clean = Object.entries(filters).filter(
      ([, v]) => v !== "" && v !== 0 && v != null
    );
    const qs = new URLSearchParams(clean).toString();
    return http(`/properties${qs ? `?${qs}` : ""}`);
  },
  get(id) {
    return http(`/properties/${id}`);
  },
  create(data) {
    return http(`/properties`, { method: "POST", body: JSON.stringify(data) });
  },
};

// ---- Authentification ------------------------------------------
export const AuthAPI = {
  login(email, password) {
    return http(`/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  register({ name, email, password }) {
    return http(`/auth/register`, {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },
  // Envoie l'ID token Google (JWT renvoyé par « Sign in with Google »).
  // Le backend DOIT vérifier ce token auprès de Google avant de créer la session.
  loginWithGoogle(credential) {
    return http(`/auth/google`, {
      method: "POST",
      body: JSON.stringify({ credential }),
    });
  },
  me() {
    return http(`/auth/me`);
  },
};

// ---- Favoris ----------------------------------------------------
export const FavoriteAPI = {
  list() {
    return http(`/favorites`);
  },
  toggle(propertyId) {
    return http(`/favorites/${propertyId}`, { method: "POST" });
  },
};

// ---- Paiement / abonnement -------------------------------------
// Branché sur le backend server/ (CinetPay, Hub2, Orange Money, MTN MoMo).
export const PaymentAPI = {
  // provider: 'cinetpay' | 'hub2' | 'orange' | 'mtnmomo'
  // method:   'orange' | 'momo' | 'card'
  checkout({ userId, provider, method, phone, otp, customer }) {
    return http(`/subscriptions/checkout`, {
      method: "POST",
      body: JSON.stringify({ userId, provider, method, phone, otp, customer }),
    });
  },
  status(reference) {
    return http(`/subscriptions/payment/${reference}/status`);
  },
  subscription(userId) {
    return http(`/subscriptions/${userId}`);
  },
  // Interroge le statut jusqu'à confirmation (mobile money = approbation sur le téléphone).
  async poll(reference, { tries = 30, interval = 3000 } = {}) {
    for (let i = 0; i < tries; i++) {
      const { status } = await this.status(reference);
      if (status === "success") return true;
      if (status === "failed") return false;
      await new Promise((r) => setTimeout(r, interval));
    }
    return false;
  },
};

