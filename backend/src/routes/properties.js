// ============================================================
// MansaRent — Routes des annonces (propriétés)
// ============================================================
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/db.js";
import { requireAuth } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import { Storage } from "../lib/storage.js";

const router = Router();

const propertySchema = z.object({
  title: z.string().min(3).max(160),
  type: z.enum(["Maison", "Appartement", "Chambre", "Villa", "Bureau", "Boutique"]),
  rentalType: z.enum(["Location longue durée", "Court séjour"]),
  price: z.number().int().positive(),
  city: z.string().min(2).max(80),
  neighborhood: z.string().max(120).optional().default(""),
  beds: z.number().int().min(0).max(30).optional().default(0),
  baths: z.number().int().min(0).max(30).optional().default(0),
  area: z.number().int().min(0).optional().default(0),
  tag: z.string().max(60).optional().nullable(),
  amenities: z.array(z.string()).optional().default([]),
  images: z.array(z.string().url()).optional().default([]),
  description: z.string().min(10).max(5000),
});

function serialize(p) {
  if (!p) return p;
  return {
    ...p,
    landlordInfo: p.landlord
      ? { name: p.landlord.name, phone: p.landlord.phone || undefined, avatar: p.landlord.avatar || undefined }
      : undefined,
    landlord: p.landlord ? { id: p.landlord.id, name: p.landlord.name, avatar: p.landlord.avatar || undefined } : undefined,
  };
}

function canPost(user) {
  if (!user) return false;
  const now = Date.now();
  const trial = user.trialEndsAt && new Date(user.trialEndsAt).getTime() > now;
  const sub = user.subscribedUntil && new Date(user.subscribedUntil).getTime() > now;
  return trial || sub || user.role === "admin";
}

// ---- Liste filtrée ------------------------------------------
// Query: city, type, rental, beds, minPrice, maxPrice, q, sort, page, limit
router.get("/", async (req, res) => {
  try {
    const { city, type, rental, beds, minPrice, maxPrice, q, sort, page, limit } = req.query;
    const where = {};
    if (city) where.city = city;
    if (type) where.type = type;
    if (rental) where.rentalType = rental;
    if (beds && Number(beds) > 0) where.beds = { gte: Number(beds) };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { neighborhood: { contains: q, mode: "insensitive" } },
      ];
    }
    const orderBy =
      sort === "price-asc" ? { price: "asc" }
      : sort === "price-desc" ? { price: "desc" }
      : sort === "new" ? { createdAt: "desc" }
      : [{ featured: "desc" }, { createdAt: "desc" }];

    const take = Math.min(Number(limit) || 24, 100);
    const skip = ((Number(page) || 1) - 1) * take;
    const [total, items] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        orderBy,
        take,
        skip,
        include: { landlord: { select: { id: true, name: true, avatar: true, phone: true } } },
      }),
    ]);
    res.json({ properties: items.map(serialize), total, page: Number(page) || 1, limit: take });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Liste des annonces impossible" });
  }
});

// ---- Détail --------------------------------------------------
router.get("/:id", async (req, res) => {
  try {
    const p = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: { landlord: { select: { id: true, name: true, avatar: true, phone: true } } },
    });
    if (!p) return res.status(404).json({ error: "Annonce introuvable" });
    res.json({ property: serialize(p) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Détail impossible" });
  }
});

// ---- Création (abonnement requis) -----------------------------
router.post("/", requireAuth, async (req, res) => {
  if (!canPost(req.user)) {
    return res.status(402).json({ error: "Abonnement requis pour publier", code: "SUBSCRIPTION_REQUIRED" });
  }
  const parsed = propertySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Données invalides", details: parsed.error.flatten() });
  }
  try {
    const p = await prisma.property.create({
      data: { ...parsed.data, landlordId: req.user.id },
      include: { landlord: { select: { id: true, name: true, avatar: true, phone: true } } },
    });
    res.status(201).json({ property: serialize(p) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Création impossible" });
  }
});

// ---- Mise à jour (propriétaire ou admin) -----------------------
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const existing = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Annonce introuvable" });
    if (existing.landlordId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Non autorisé" });
    }
    const parsed = propertySchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Données invalides" });
    const p = await prisma.property.update({
      where: { id: req.params.id },
      data: parsed.data,
      include: { landlord: { select: { id: true, name: true, avatar: true, phone: true } } },
    });
    res.json({ property: serialize(p) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Mise à jour impossible" });
  }
});

// ---- Suppression (propriétaire ou admin) -----------------------
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const existing = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Annonce introuvable" });
    if (existing.landlordId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Non autorisé" });
    }
    await prisma.property.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Suppression impossible" });
  }
});

// ---- Upload d'images (multipart → Cloudflare R2) ----------------
router.post("/:id/images", requireAuth, upload.array("images", 8), async (req, res) => {
  try {
    const existing = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Annonce introuvable" });
    if (existing.landlordId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Non autorisé" });
    }
    if (!req.files?.length) return res.status(400).json({ error: "Aucune image reçue" });
    const urls = [];
    for (const f of req.files) {
      const ext = (f.mimetype.split("/")[1] || "jpg").split("+")[0];
      const r = await Storage.upload(f.buffer, { contentType: f.mimetype, ext });
      if (r.url) urls.push(r.url);
    }
    if (!urls.length) {
      return res.status(503).json({ error: "Stockage R2 non configuré (mode démo)" });
    }
    const current = Array.isArray(existing.images) ? existing.images : [];
    const p = await prisma.property.update({
      where: { id: req.params.id },
      data: { images: [...current, ...urls] },
    });
    res.json({ property: serialize(p), uploaded: urls });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Upload impossible" });
  }
});

export default router;
