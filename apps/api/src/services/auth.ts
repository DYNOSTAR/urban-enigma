import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import { env } from "../config/env";
import { JwtPayload } from "../types";
import { prisma } from "../lib/prisma";

export const hashPassword = (password: string) => bcrypt.hash(password, 10);
export const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash);

export const signAccessToken = (payload: JwtPayload) =>
  jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.accessExp });

export const signRefreshToken = async (payload: JwtPayload) => {
  const rawToken = randomBytes(48).toString("hex");
  const tokenHash = await bcrypt.hash(rawToken, 10);
  const expiresAt = new Date(Date.now() + env.refreshDays * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({ data: { tokenHash, userId: payload.userId, expiresAt } });
  return rawToken;
};

export const rotateRefreshToken = async (rawToken: string, payload: JwtPayload) => {
  const tokens = await prisma.refreshToken.findMany({ where: { userId: payload.userId } });
  const match = await Promise.all(tokens.map(async (t) => ((await bcrypt.compare(rawToken, t.tokenHash)) ? t : null)));
  const found = match.find(Boolean);
  if (!found || found.expiresAt < new Date()) return null;

  await prisma.refreshToken.delete({ where: { id: found.id } });
  const next = await signRefreshToken(payload);
  return next;
};

export const revokeRefreshToken = async (rawToken: string, userId: string) => {
  const tokens = await prisma.refreshToken.findMany({ where: { userId } });
  for (const token of tokens) {
    if (await bcrypt.compare(rawToken, token.tokenHash)) {
      await prisma.refreshToken.delete({ where: { id: token.id } });
      return;
    }
  }
};
