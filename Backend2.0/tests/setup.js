// Vitest global setup — runs before each test file
// Set required env vars so src/config/env.js never throws

process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/mint_test?sslmode=disable";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_1234567890_long_enough";
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || "1d";
process.env.SESSION_SECRET = process.env.SESSION_SECRET || "test_session_secret_1234567890";
process.env.CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
process.env.LOG_LEVEL = "silent";
process.env.PORT = process.env.PORT || "8080";
process.env.LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || "test_linkedin_id";
process.env.LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || "test_linkedin_secret";
process.env.LINKEDIN_CALLBACK_URL =
  process.env.LINKEDIN_CALLBACK_URL || "http://localhost:8080/api/auth/linkedin/callback";

// Silence pino during tests (optional)
import { vi } from "vitest";

// Mock pino pretty transport noise if needed - keep real logger but silent level is enough
