// ============================================================
// MansaRent — ZeptoMail (email transactionnel via API REST)
// Docs: https://www.zoho.com/zeptomail/help/api/email-sending.html
// ============================================================

const ZEPTO_URL = "https://api.zeptomail.com/v1.1/email";
const FROM = {
  address: process.env.MAIL_FROM || "noreply@mansarent.com",
  name: process.env.MAIL_FROM_NAME || "MansaRent",
};

function headers() {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: process.env.ZEPTOMAIL_API_KEY || "",
  };
}

async function send({ to, subject, html, text }) {
  // Mode dev : sans clé, on log au lieu d'envoyer
  if (!process.env.ZEPTOMAIL_API_KEY) {
    console.log(`[mail:demo] to=${to} subject=${subject}`);
    return { demo: true };
  }
  const body = {
    from: FROM,
    to: [{ email_address: { address: to } }],
    subject,
    htmlbody: html || `<p>${text || subject}</p>`,
    ...(text ? { textbody: text } : {}),
  };
  const r = await fetch(ZEPTO_URL, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`ZeptoMail: ${j?.message || r.statusText}`);
  return j;
}

export const Mailer = {
  welcome(to, name) {
    return send({
      to,
      subject: "Bienvenue sur MansaRent 🎉",
      html: `<h2>Bienvenue ${name} !</h2><p>Votre compte est créé. Vous bénéficiez de <b>30 jours d'essai gratuit</b> pour publier vos annonces.</p><p>Trouvez. Louez. Emménagez.</p>`,
      text: `Bienvenue ${name} ! Votre compte est créé avec 30 jours d'essai gratuit.`,
    });
  },
  passwordReset(to, link) {
    return send({
      to,
      subject: "Réinitialisation de votre mot de passe",
      html: `<p>Cliquez sur ce lien pour réinitialiser votre mot de passe (valide 1h) :</p><p><a href="${link}">${link}</a></p>`,
      text: `Réinitialisez votre mot de passe : ${link}`,
    });
  },
  subscriptionConfirmed(to, untilDate) {
    return send({
      to,
      subject: "Abonnement MansaRent Pro activé ✅",
      html: `<p>Votre abonnement Pro est actif jusqu'au <b>${untilDate}</b>.</p><p>Vous pouvez publier vos annonces.</p>`,
      text: `Abonnement Pro actif jusqu'au ${untilDate}.`,
    });
  },
  newMessage(to, senderName, propertyTitle) {
    return send({
      to,
      subject: `Nouveau message de ${senderName}`,
      html: `<p><b>${senderName}</b> vous a écrit au sujet de « ${propertyTitle} ». Connectez-vous pour répondre.</p>`,
      text: `${senderName} vous a écrit au sujet de « ${propertyTitle} ».`,
    });
  },
};
