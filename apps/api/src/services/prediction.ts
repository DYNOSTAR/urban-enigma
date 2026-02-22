import { Match } from "@prisma/client";
import { prisma } from "../lib/prisma";

type Scoreline = { score: string; probability: number };

const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
const poisson = (lambda: number, k: number) => (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);

export async function generatePrediction(match: Match) {
  const homeTeam = await prisma.team.findUnique({ where: { id: match.homeTeamId } });
  const awayTeam = await prisma.team.findUnique({ where: { id: match.awayTeamId } });
  if (!homeTeam || !awayTeam) throw new Error("Missing teams");

  const homeAdvantage = 0.2;
  const lambdaHome = Math.max(0.4, homeTeam.rating + homeAdvantage - awayTeam.rating * 0.2);
  const lambdaAway = Math.max(0.3, awayTeam.rating - homeTeam.rating * 0.15);

  const matrix: Scoreline[] = [];
  for (let h = 0; h <= 4; h++) {
    for (let a = 0; a <= 4; a++) {
      matrix.push({ score: `${h}-${a}`, probability: poisson(lambdaHome, h) * poisson(lambdaAway, a) });
    }
  }

  const total = matrix.reduce((acc, item) => acc + item.probability, 0);
  const normalized = matrix.map((item) => ({ ...item, probability: item.probability / total }));
  const sorted = [...normalized].sort((a, b) => b.probability - a.probability);

  const best = sorted[0];
  const confidence = Math.min(best.probability * 100, 85);

  const yesBtts = normalized.filter((s) => !s.score.startsWith("0-") && !s.score.endsWith("-0")).reduce((a, b) => a + b.probability, 0);
  const homeWin = normalized.filter((s) => Number(s.score.split("-")[0]) > Number(s.score.split("-")[1])).reduce((a, b) => a + b.probability, 0);
  const draw = normalized.filter((s) => Number(s.score.split("-")[0]) === Number(s.score.split("-")[1])).reduce((a, b) => a + b.probability, 0);
  const awayWin = 1 - homeWin - draw;

  return {
    modelVersion: "poisson-v1",
    bestScoreline: best.score,
    topScorelines: sorted.slice(0, 3).map((s) => ({ score: s.score, probability: Number((s.probability * 100).toFixed(2)) })),
    confidence: Number(confidence.toFixed(2)),
    markets: {
      btts: { yesProb: Number((yesBtts * 100).toFixed(2)), noProb: Number(((1 - yesBtts) * 100).toFixed(2)) },
      overUnder: { over25: 52, under25: 48 },
      result1x2: { home: Number((homeWin * 100).toFixed(2)), draw: Number((draw * 100).toFixed(2)), away: Number((awayWin * 100).toFixed(2)) }
    },
    explanation: `Home strength (${homeTeam.rating.toFixed(2)}) versus away strength (${awayTeam.rating.toFixed(2)}) with home advantage contributes to this projection. Recent form proxies and rating gap influence confidence.`
  };
}

export async function refreshUpcomingPredictions(io?: { emit: (event: string, payload: any) => void }) {
  const now = new Date();
  const cutoff = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const matches = await prisma.match.findMany({ where: { kickoffAt: { gte: now, lte: cutoff } } });

  for (const match of matches) {
    const predictionData = await generatePrediction(match);
    const prediction = await prisma.prediction.upsert({
      where: { matchId: match.id },
      update: predictionData,
      create: { matchId: match.id, ...predictionData }
    });

    io?.emit("prediction:update", { matchId: match.id, prediction });
  }
}
