// ============================================================
// MansaRent — Administration (réservé au rôle admin)
// C'est ici que vous « voyez et gérez tout » : stats,
// utilisateurs, annonces, abonnements.
// ============================================================
import { Router } from "express";
import { prisma } from "../lib/db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireAdmin);

// ---- Tableau de bord : chiffres clés -------------------------------
router.get("/stats", async (_req, res) => {
  try {
    const [users, properties, payments, subscriptions, messages, reviews] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.payment.findMany({ where: { status: "success" }, select: { amount: true } }),
      prisma.subscription.count(),
      prisma.message.count(),
      prisma.review.count(),
    ]);
    const revenue = payments.reduce((s, p) => s + p.amount, 0);
    res.json({ users, properties, subscriptions, messages, reviews, revenue, currency: "GNF" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Stats impossibles" });
  }
});

// ---- Utilisateurs ----------------------------------------------------
router.get("/users", async (req, res) => {
  try {
    const { page, limit, q } = req.query;
    const take = Math.min(Number(limit) || 25, 100);
    const skip = ((Number(page) || 1) - 1) * take;
    const where = q
      ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }
      : {};
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({ where, take, skip, orderBy: { createdAt: "desc" } }),
    ]);
    res.json({ users: users.map(({ password, ...u }) => u), total });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Utilisateurs impossibles à charger" });
  }
});

router.put("/users/:id/role", async (req, res) => {
  const { role } = req.body || {};
  if (!["tenant", "landlord", "agent", "admin"].includes(role)) {
    return res.status(400).json({ error: "Rôle invalide" });
  }
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { role } });
    const { password, ...safe } = user;
    res.json({ user: safe });
  } catch {
    res.status(404).json({ error: "Utilisateur introuvable" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Utilisateur introuvable" });
  }
});

// ---- Annonces ----------------------------------------------------------
router.get("/properties", async (req, res) => {
  try {
    const { page, limit } = req.query;
    const take = Math.min(Number(limit) || 25, 100);
    const skip = ((Number(page) || 1) - 1) * take;
    const [total, properties] = await Promise.all([
      prisma.property.count(),
      prisma.property.findMany({
        take, skip, orderBy: { createdAt: "desc" },
        include: { landlord: { select: { id: true, name: true, email: true } } },
      }),
    ]);
    res.json({ properties, total });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Annonces impossibles à charger" });
  }
});

router.put("/properties/:id/featured", async (req, res) => {
  try {
    const p = await prisma.property.update({
      where: { id: req.params.id },
      data: { featured: req.body?.featured ?? true },
    });
    res.json({ property: p });
  } catch {
    res.status(404).json({ error: "Annonce introuvable" });
  }
});

router.delete("/properties/:id", async (req, res) => {
  try {
    await prisma.property.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Annonce introuvable" });
  }
});

// ---- Abonnements & paiements ----------------------------------------------
router.get("/subscriptions", async (_req, res) => {
  try {
    const subs = await prisma.subscription.findMany({
      take: 100, orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.json({ subscriptions: subs });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Abonnements impossibles à charger" });
  }
});

router.get("/payments", async (_req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      take: 100, orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.json({ payments });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Paiements impossibles à charger" });
  }
});

export default router;
