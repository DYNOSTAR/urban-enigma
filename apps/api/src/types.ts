import { Role } from "@prisma/client";

export type JwtPayload = {
  userId: string;
  role: Role;
  email: string;
};
