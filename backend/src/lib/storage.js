// ============================================================
// MansaRent — Stockage images via Cloudflare R2 (API compatible S3)
// ============================================================
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const enabled =
  !!process.env.R2_ACCOUNT_ID &&
  !!process.env.R2_ACCESS_KEY_ID &&
  !!process.env.R2_SECRET_ACCESS_KEY &&
  !!process.env.R2_BUCKET_NAME;

let s3 = null;
if (enabled) {
  s3 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

const BUCKET = process.env.R2_BUCKET_NAME || "";
const PUBLIC_URL = process.env.R2_PUBLIC_URL || ""; // ex. https://pub-xxx.r2.dev

export const Storage = {
  enabled,
  async upload(buffer, { contentType = "image/jpeg", ext = "jpg", prefix = "properties" } = {}) {
    // Sans R2 configuré : on signale le mode démo (le frontend garde ses URLs)
    if (!enabled) return { demo: true, url: null };
    const key = `${prefix}/${new Date().getFullYear()}/${randomUUID()}.${ext}`;
    await s3.send(
      new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: contentType })
    );
    const url = PUBLIC_URL ? `${PUBLIC_URL}/${key}` : await this.signedUrl(key);
    return { key, url };
  },
  async signedUrl(key, expiresIn = 3600) {
    if (!enabled) return null;
    return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn });
  },
};
