import { Router } from "express";
import { leagueSchema, matchSchema, teamSchema } from "@sure-odds/shared";
import { prisma } from "../lib/prisma";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { refreshUpcomingPredictions } from "../services/prediction";

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.post("/admin/leagues", validateBody(leagueSchema), async (req, res) => {
  const league = await prisma.league.create({ data: req.body });
  res.status(201).json(league);
});

adminRouter.post("/admin/teams", validateBody(teamSchema), async (req, res) => {
  const team = await prisma.team.create({ data: { ...req.body, rating: 1 + Math.random() } });
  res.status(201).json(team);
});

adminRouter.post("/admin/matches", validateBody(matchSchema), async (req, res) => {
  const match = await prisma.match.create({
    data: { ...req.body, kickoffAt: new Date(req.body.kickoffAt), status: req.body.status }
  });
  res.status(201).json(match);
});

adminRouter.post("/admin/refresh-predictions", async (_req, res) => {
  await refreshUpcomingPredictions();
  res.json({ message: "Predictions refreshed" });
});
