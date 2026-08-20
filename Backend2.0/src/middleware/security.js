import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

/** Baseline HTTP hardening headers */
export const helmetMiddleware = helmet({
  contentSecurityPolicy: env.isProduction ? undefined : false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

/**
 * Use validated IP with trust proxy. express-rate-limit defaults to
 * `req.ip` which is spoofable without keyGenerator + trust proxy.
 * Here we rely on `app.set('trust proxy', 1)` in app.js and explicitly
 * key by `req.ip`.
 */
function ipKeyGenerator(req) {
  return req.ip;
}

/** General API rate limit */
export const apiRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator,
  // MemoryStore resets on restart / doesn't share across instances.
  // For horizontal scaling use a distributed store (e.g. rate-limit-redis).
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
  keyGenerator: ipKeyGenerator,
  message: {
    success: false,
    message: "Too many auth attempts. Please try again later.",
    code: "AUTH_RATE_LIMITED",
  },
});
