// ============================================================
// MansaRent — Avis (reviews) sur annonces et agents
// ============================================================
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const reviewSchema = z.object({
  propertyId: z.string().optional(),
  agentId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(2).max(2000),
});

// ---- Liste des avis ------------------------------------------
// GET /reviews?propertyId=xxx  ou  ?agentId=xxx
router.get("/", async (req, res) => {
  try {
    const { propertyId, agentId } = req.query;
    const where = {};
    if (propertyId) where.propertyId = propertyId;
    if (agentId) {
      // Avis liés aux annonces de l'agent + avis directs sur l'agent
      const props = await prisma.property.findMany({
        where: { landlordId: agentId },
        select: { id: true },
      });
      const ids = props.map((p) => p.id);
      where.OR = [{ agentId }, ...(ids.length ? [{ propertyId: { in: ids } }] : [])];
    }
    if (!propertyId && !agentId) return res.status(400).json({ error: "propertyId ou agentId requis" });
    const reviews = await prisma.review.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 });
    res.json({ reviews });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Avis impossibles à charger" });
  }
});

// ---- Publier un avis (connexion requise) -----------------------
router.post("/", requireAuth, async (req, res) => {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success || (!parsed.data.propertyId && !parsed.data.agentId)) {
    return res.status(400).json({ error: "propertyId ou agentId + rating + text requis" });
  }
  try {
    const review = await prisma.review.create({
      data: { ...parsed.data, author: req.user.name },
    });
    res.status(201).json({ review });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Publication impossible" });
  }
});

export default router;
