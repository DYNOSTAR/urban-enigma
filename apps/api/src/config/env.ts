import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL || "",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "",
  accessExp: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  refreshDays: Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  cookieSecure: process.env.COOKIE_SECURE === "true"
};
