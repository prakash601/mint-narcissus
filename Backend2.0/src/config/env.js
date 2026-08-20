/**
 * Central env access + boot-time validation.
 * Load dotenv before importing this module (see server.js).
 */

function requireEnv(name) {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name, fallback) {
  const value = process.env[name];
  if (value === undefined || value === null || String(value).trim() === "") {
    return fallback;
  }
  return value;
}

const isProduction = process.env.NODE_ENV === "production";

/** Validate secrets that must never fall back to hard-coded defaults. */
export function validateEnv() {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 16) {
    throw new Error(
      "JWT_SECRET is required and must be at least 16 characters. Set it in Backend2.0/.env",
    );
  }

  if (
    isProduction &&
    (jwtSecret.includes("change_me") || jwtSecret === "your_jwt_secret_here" || jwtSecret === "jwt_secret")
  ) {
    throw new Error("JWT_SECRET must be a strong unique value in production");
  }

  requireEnv("DATABASE_URL");

  if (isProduction) {
    requireEnv("CLIENT_URL");
  }
}

export const env = {
  nodeEnv: optionalEnv("NODE_ENV", "development"),
  isProduction,
  port: Number(optionalEnv("PORT", "8080")),
  logLevel: optionalEnv("LOG_LEVEL", isProduction ? "info" : "debug"),

  databaseUrl: process.env.DATABASE_URL,

  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: optionalEnv("JWT_EXPIRE", "1d"),
  cookieMaxAgeMs: Number(optionalEnv("COOKIE_MAX_AGE_MS", String(24 * 60 * 60 * 1000))),

  /** Single frontend origin for CORS, OAuth redirects, Socket.io */
  clientUrl: optionalEnv("CLIENT_URL", "http://localhost:5173"),

  linkedinClientId: process.env.LINKEDIN_CLIENT_ID,
  linkedinClientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  linkedinCallbackUrl: process.env.LINKEDIN_CALLBACK_URL,

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  /** Rate limiting */
  rateLimitWindowMs: Number(optionalEnv("RATE_LIMIT_WINDOW_MS", String(15 * 60 * 1000))),
  rateLimitMax: Number(optionalEnv("RATE_LIMIT_MAX", "300")),
  authRateLimitWindowMs: Number(optionalEnv("AUTH_RATE_LIMIT_WINDOW_MS", String(15 * 60 * 1000))),
  authRateLimitMax: Number(optionalEnv("AUTH_RATE_LIMIT_MAX", "30")),
};

export default env;
