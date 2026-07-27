import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./modules/auth/passport.js";

import authRoutes from "./modules/auth/auth.routes.js";
import itemRoutes from "./modules/items/item.routes.js";
import rentalRoutes from "./modules/rental/rental.routes.js";

import { env } from "./config/env.js";
import { pool } from "./config/database.js";
import { createLogger } from "./shared/logger/index.js";
import { correlationId } from "./shared/logger/middleware/correlationId.js";
import { requestContext } from "./shared/logger/middleware/requestContext.js";
import { createHttpLogger } from "./shared/logger/middleware/httpLogger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { helmetMiddleware, apiRateLimiter } from "./middleware/security.js";

const app = express();
const logger = createLogger("app");

app.set("trust proxy", 1);

app.use(helmetMiddleware);

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", apiRateLimiter);

app.use((req, res, next) => {
  delete req.headers["x-user-id"];
  next();
});

app.use(correlationId);
app.use(requestContext);
app.use(createHttpLogger(logger));

app.use((req, res, next) => {
  if (req.app.get("io")) {
    req.io = req.app.get("io");
  }
  next();
});

app.use(passport.initialize());

app.get("/health", async (_req, res) => {
  let database = "unknown";
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    database = "up";
  } catch {
    database = "down";
  }

  const healthy = database === "up";
  res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    service: "mint-narcissus-backend",
    database,
    uptime: process.uptime(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/messages", rentalRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
