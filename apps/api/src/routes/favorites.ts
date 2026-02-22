import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const favoriteRouter = Router();
favoriteRouter.use(requireAuth);

favoriteRouter.post("/favorites/:matchId", async (req, res) => {
  const fav = await prisma.favorite.upsert({
    where: { userId_matchId: { userId: req.user!.userId, matchId: req.params.matchId } },
    update: {},
    create: { userId: req.user!.userId, matchId: req.params.matchId }
  });
  res.status(201).json(fav);
});

favoriteRouter.delete("/favorites/:matchId", async (req, res) => {
  await prisma.favorite.deleteMany({ where: { userId: req.user!.userId, matchId: req.params.matchId } });
  res.status(204).send();
});

favoriteRouter.get("/favorites", async (req, res) => {
  const favorites = await prisma.favorite.findMany({ where: { userId: req.user!.userId }, include: { match: { include: { homeTeam: true, awayTeam: true, prediction: true, league: true } } } });
  res.json(favorites);
});
