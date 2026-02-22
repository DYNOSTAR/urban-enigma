import { Router } from "express";
import { matchFilterSchema } from "@sure-odds/shared";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const matchRouter = Router();

matchRouter.get("/matches", requireAuth, async (req, res) => {
  const parsed = matchFilterSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const { date, leagueId, minConfidence } = parsed.data;
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  if (date === "today") {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (date === "tomorrow") {
    start.setDate(start.getDate() + 1);
    end.setDate(end.getDate() + 1);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else {
    end.setDate(end.getDate() + 2);
  }

  const matches = await prisma.match.findMany({
    where: {
      kickoffAt: { gte: start, lte: end },
      ...(leagueId ? { leagueId } : {}),
      ...(minConfidence ? { prediction: { confidence: { gte: minConfidence } } } : {})
    },
    include: { league: true, homeTeam: true, awayTeam: true, prediction: true },
    orderBy: { kickoffAt: "asc" }
  });

  res.json(matches);
});

matchRouter.get("/matches/:id", requireAuth, async (req, res) => {
  const match = await prisma.match.findUnique({
    where: { id: req.params.id },
    include: { league: true, homeTeam: true, awayTeam: true, prediction: true }
  });
  if (!match) return res.status(404).json({ message: "Not found" });

  res.json({
    ...match,
    formSummary: `${match.homeTeam.name} rating ${match.homeTeam.rating.toFixed(2)}, ${match.awayTeam.name} rating ${match.awayTeam.rating.toFixed(2)}.`,
    headToHeadSummary: "Historical meetings are approximated in this MVP with team strength differentials.",
    performanceSnippet: "Model confidence tracks consistency in top projected scorelines over recent refresh cycles."
  });
});
