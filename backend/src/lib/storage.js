// ============================================================
// MansaRent — Stockage images via Cloudflare R2 (API compatible S3)
// ============================================================
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const hasR2 = () =>
  !!process.env.R2_ACCOUNT_ID &&
  !!process.env.R2_ACCESS_KEY_ID &&
  !!process.env.R2_SECRET_ACCESS_KEY &&
  !!process.env.R2_BUCKET_NAME;

// Client construit à la demande : les clés peuvent arriver de l'admin
// (syncIntegrationsToEnv) après le démarrage — pas seulement du .env.
function client() {
  if (!hasR2()) return null;
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

export const Storage = {
  get enabled() { return hasR2(); },
  async upload(buffer, { contentType = "image/jpeg", ext = "jpg", prefix = "properties" } = {}) {
    // Sans R2 configuré : on signale le mode démo (le frontend garde ses URLs)
    const s3 = client();
    if (!s3) return { demo: true, url: null };
    const BUCKET = process.env.R2_BUCKET_NAME || "";
    const PUBLIC_URL = process.env.R2_PUBLIC_URL || ""; // ex. https://pub-xxx.r2.dev
    const key = `${prefix}/${new Date().getFullYear()}/${randomUUID()}.${ext}`;
    await s3.send(
      new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: contentType })
    );
    const url = PUBLIC_URL ? `${PUBLIC_URL}/${key}` : await this.signedUrl(key);
    return { key, url };
  },
  async signedUrl(key, expiresIn = 3600) {
    const s3 = client();
    if (!s3) return null;
    return getSignedUrl(s3, new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }), { expiresIn });
  },
};
