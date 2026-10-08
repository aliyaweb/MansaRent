// ============================================================
// MansaRent — Profils agents (propriétaires / agences)
// ============================================================
import { Router } from "express";
import { prisma } from "../lib/db.js";
import { sanitize } from "../middleware/auth.js";

const router = Router();

// ---- Profil agent + annonces + note moyenne ----------------------
router.get("/:id", async (req, res) => {
  try {
    const agent = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!agent) return res.status(404).json({ error: "Agent introuvable" });
    const agentProps = await prisma.property.findMany({
      where: { landlordId: agent.id },
      select: { id: true },
    });
    const propIds = agentProps.map((p) => p.id);
    const [properties, propReviews, directReviews] = await Promise.all([
      prisma.property.findMany({
        where: { landlordId: agent.id },
        orderBy: { createdAt: "desc" },
        include: { landlord: { select: { id: true, name: true, avatar: true } } },
      }),
      propIds.length
        ? prisma.review.findMany({ where: { propertyId: { in: propIds } } })
        : Promise.resolve([]),
      prisma.review.findMany({ where: { agentId: agent.id } }),
    ]);
    const all = [...propReviews, ...directReviews];
    const rating = all.length ? all.reduce((s, r) => s + r.rating, 0) / all.length : 0;
    res.json({
      agent: sanitize(agent),
      properties,
      rating: Math.round(rating * 10) / 10,
      reviewCount: all.length,
      reviews: [...directReviews, ...propReviews].slice(0, 20),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Profil impossible à charger" });
  }
});

export default router;
