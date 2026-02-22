import { Router } from "express";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "@sure-odds/shared";
import { validateBody } from "../middleware/validate";
import { comparePassword, hashPassword, revokeRefreshToken, rotateRefreshToken, signAccessToken, signRefreshToken } from "../services/auth";
import { prisma } from "../lib/prisma";

const resetTokens = new Map<string, string>();
export const authRouter = Router();

const setRefreshCookie = (res: any, token: string) =>
  res.cookie("refreshToken", token, { httpOnly: true, secure: process.env.COOKIE_SECURE === "true", sameSite: "lax" });

authRouter.post("/register", validateBody(registerSchema), async (req, res) => {
  const exists = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (exists) return res.status(409).json({ message: "Email already in use" });

  const user = await prisma.user.create({ data: { email: req.body.email, passwordHash: await hashPassword(req.body.password) } });
  const payload = { userId: user.id, role: user.role, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = await signRefreshToken(payload);
  setRefreshCookie(res, refreshToken);

  res.status(201).json({ accessToken, user: { id: user.id, email: user.email, role: user.role } });
});

authRouter.post("/login", validateBody(loginSchema), async (req, res) => {
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (!user || !(await comparePassword(req.body.password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const payload = { userId: user.id, role: user.role, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = await signRefreshToken(payload);
  setRefreshCookie(res, refreshToken);

  res.json({ accessToken, user: { id: user.id, email: user.email, role: user.role } });
});

authRouter.post("/refresh", async (req, res) => {
  const token = req.cookies.refreshToken;
  const userId = req.body.userId;
  if (!token || !userId) return res.status(400).json({ message: "Missing refresh credentials" });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ message: "Invalid user" });

  const payload = { userId: user.id, role: user.role, email: user.email };
  const nextToken = await rotateRefreshToken(token, payload);
  if (!nextToken) return res.status(401).json({ message: "Invalid refresh token" });

  setRefreshCookie(res, nextToken);
  res.json({ accessToken: signAccessToken(payload) });
});

authRouter.post("/logout", async (req, res) => {
  const token = req.cookies.refreshToken;
  const userId = req.body.userId;
  if (token && userId) await revokeRefreshToken(token, userId);
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
});

authRouter.post("/forgot-password", validateBody(forgotPasswordSchema), async (req, res) => {
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (user) {
    const token = Math.random().toString(36).slice(2) + Date.now();
    resetTokens.set(token, user.id);
  }
  res.json({ message: "If the account exists, a reset token was generated for development." });
});

authRouter.post("/reset-password", validateBody(resetPasswordSchema), async (req, res) => {
  const userId = resetTokens.get(req.body.token);
  if (!userId) return res.status(400).json({ message: "Invalid reset token" });

  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(req.body.password) } });
  resetTokens.delete(req.body.token);
  res.json({ message: "Password updated" });
});
