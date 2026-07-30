import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

/** Baseline HTTP hardening headers */
export const helmetMiddleware = helmet({
  contentSecurityPolicy: env.isProduction ? undefined : false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

/** General API rate limit */
export const apiRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
    code: "RATE_LIMITED",
  },
});

/** Stricter limit for login / register */
export const authRateLimiter = rateLimit({
  windowMs: env.authRateLimitWindowMs,
  max: env.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many auth attempts. Please try again later.",
    code: "AUTH_RATE_LIMITED",
  },
});
