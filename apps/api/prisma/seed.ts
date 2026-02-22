import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { generatePrediction } from "../src/services/prediction";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "AdminPass123!";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN"
    }
  });

  const league1 = await prisma.league.upsert({ where: { id: "cm1leaguepremier00000000001" }, update: {}, create: { id: "cm1leaguepremier00000000001", name: "Premier League", country: "England" } });
  const league2 = await prisma.league.upsert({ where: { id: "cm1leaguelaliga00000000002" }, update: {}, create: { id: "cm1leaguelaliga00000000002", name: "La Liga", country: "Spain" } });

  const teamsData = [
    ["Arsenal", league1.id, 1.4], ["Liverpool", league1.id, 1.55], ["Chelsea", league1.id, 1.2], ["Tottenham", league1.id, 1.3],
    ["Real Madrid", league2.id, 1.6], ["Barcelona", league2.id, 1.5], ["Atletico Madrid", league2.id, 1.35], ["Sevilla", league2.id, 1.1]
  ] as const;

  const teamIds: string[] = [];
  for (const [name, leagueId, rating] of teamsData) {
    const team = await prisma.team.upsert({
      where: { id: `${name.replace(/\s/g, "").toLowerCase()}_${leagueId}`.slice(0, 25) },
      update: { name, leagueId, rating },
      create: { id: `${name.replace(/\s/g, "").toLowerCase()}_${leagueId}`.slice(0, 25), name, leagueId, rating }
    });
    teamIds.push(team.id);
  }

  await prisma.match.deleteMany();
  const base = new Date();
  const matches = [];
  for (let i = 0; i < 10; i++) {
    const dayOffset = i < 5 ? 0 : 1;
    const kickoff = new Date(base.getTime() + dayOffset * 24 * 60 * 60 * 1000 + (i % 5) * 2 * 60 * 60 * 1000);
    const leagueId = i % 2 === 0 ? league1.id : league2.id;
    const homeTeamId = teamIds[(i + 1) % 8];
    const awayTeamId = teamIds[(i + 4) % 8];
    const match = await prisma.match.create({ data: { leagueId, homeTeamId, awayTeamId, kickoffAt: kickoff, status: "SCHEDULED" } });
    matches.push(match);
  }

  for (const match of matches) {
    const p = await generatePrediction(match);
    await prisma.prediction.upsert({ where: { matchId: match.id }, update: p, create: { matchId: match.id, ...p } });
  }
}

main().finally(async () => prisma.$disconnect());
