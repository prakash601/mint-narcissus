import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

// Mock database module BEFORE importing app
vi.mock("../../src/config/database.js", () => {
  const mockClient = {
    query: vi.fn().mockResolvedValue({ rows: [] }),
    release: vi.fn(),
  };
  const mockPool = {
    connect: vi.fn().mockResolvedValue(mockClient),
    on: vi.fn(),
  };
  const mockDb = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(),
  };
  return {
    pool: mockPool,
    db: mockDb,
    connectDB: vi.fn(),
  };
});

import app from "../../src/app.js";
import { pool } from "../../src/config/database.js";

describe("app integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /health", () => {
    it("returns 200 when DB is up", async () => {
      // pool.connect already mocked to succeed by default
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
      expect(res.body.database).toBe("up");
      expect(res.body.service).toBe("mint-narcissus-backend");
    });

    it("returns 503 when DB is down", async () => {
      pool.connect.mockRejectedValueOnce(new Error("DB down"));
      const res = await request(app).get("/health");
      expect(res.status).toBe(503);
      expect(res.body.status).toBe("degraded");
      expect(res.body.database).toBe("down");
    });
  });

  describe("404 handler", () => {
    it("returns 404 for unknown route", async () => {
      const res = await request(app).get("/unknown-route-xyz");
      expect(res.status).toBe(404);
      expect(res.body.code).toBe("NOT_FOUND");
    });
  });

  describe("auth routes - validation", () => {
    it("POST /api/auth/register rejects empty body with 400", async () => {
      const res = await request(app).post("/api/auth/register").send({});
      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_ERROR");
    });

    it("POST /api/auth/register rejects invalid email", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Alice",
        email: "not-email",
        password: "password123",
      });
      expect(res.status).toBe(400);
    });

    it("POST /api/auth/login rejects missing password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "a@b.com",
      });
      expect(res.status).toBe(400);
    });

    it("GET /api/auth/me rejects unauthenticated", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
      expect(res.body.code).toBe("UNAUTHORIZED");
    });

    it("GET /api/auth/me rejects invalid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalidtoken");
      expect(res.status).toBe(401);
    });
  });

  describe("items routes - auth guard", () => {
    it("GET /api/items requires auth", async () => {
      const res = await request(app).get("/api/items");
      expect(res.status).toBe(401);
    });

    it("GET /api/items/my requires auth", async () => {
      const res = await request(app).get("/api/items/my");
      expect(res.status).toBe(401);
    });
  });

  describe("rental routes - auth guard", () => {
    it("POST /api/messages/request requires auth", async () => {
      const res = await request(app).post("/api/messages/request").send({ outfitId: 1 });
      expect(res.status).toBe(401);
    });

    it("GET /api/messages/requests/incoming requires auth", async () => {
      const res = await request(app).get("/api/messages/requests/incoming");
      expect(res.status).toBe(401);
    });
  });

  describe("security headers", () => {
    it("includes helmet headers", async () => {
      const res = await request(app).get("/health");
      // helmet sets X-DNS-Prefetch-Control, X-Frame-Options etc
      expect(res.headers["x-dns-prefetch-control"]).toBeDefined();
    });
  });
});
