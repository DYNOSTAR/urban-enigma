import { z } from "zod";

export const roleSchema = z.enum(["USER", "ADMIN"]);
export const statusSchema = z.enum(["SCHEDULED", "LIVE", "FT"]);

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const loginSchema = registerSchema;

export const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8)
});

export const leagueSchema = z.object({
  name: z.string().min(2),
  country: z.string().min(2)
});

export const teamSchema = z.object({
  name: z.string().min(2),
  leagueId: z.string().cuid()
});

export const matchSchema = z.object({
  leagueId: z.string().cuid(),
  homeTeamId: z.string().cuid(),
  awayTeamId: z.string().cuid(),
  kickoffAt: z.string().datetime(),
  status: statusSchema.default("SCHEDULED")
});

export const matchFilterSchema = z.object({
  date: z.enum(["today", "tomorrow"]).optional(),
  leagueId: z.string().cuid().optional(),
  minConfidence: z.coerce.number().min(0).max(100).optional()
});

export type Role = z.infer<typeof roleSchema>;
