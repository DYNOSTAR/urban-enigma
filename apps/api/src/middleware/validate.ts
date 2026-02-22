import { AnyZodObject } from "zod";
import { NextFunction, Request, Response } from "express";

export const validateBody = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  req.body = parsed.data;
  next();
};
