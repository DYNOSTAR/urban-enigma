import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import http from "http";
import { Server } from "socket.io";
import { env } from "./config/env";
import { authRouter } from "./routes/auth";
import { userRouter } from "./routes/user";
import { matchRouter } from "./routes/matches";
import { favoriteRouter } from "./routes/favorites";
import { adminRouter } from "./routes/admin";
import { refreshUpcomingPredictions } from "./services/prediction";

const app = express();
const server = http.createServer(app);
const allowOrigins = env.corsOrigin.split(",").map((x) => x.trim());

const io = new Server(server, {
  cors: {
    origin: allowOrigins,
    credentials: true
  }
});

app.use(helmet());
app.use(cors({ origin: allowOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 25 });
app.use("/auth", authLimiter);

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/auth", authRouter);
app.use(userRouter);
app.use(matchRouter);
app.use(favoriteRouter);
app.use(adminRouter);

setInterval(() => {
  refreshUpcomingPredictions(io).catch((err) => console.error("refresh error", err));
}, 120000);

server.listen(env.port, () => {
  console.log(`API listening on ${env.port}`);
});
