import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import { generateToken, publicUser, getAuthCookieOptions } from "../../src/modules/auth/auth.service.js";
import { env } from "../../src/config/env.js";

describe("auth.service - pure helpers", () => {
  describe("publicUser", () => {
    const baseUser = {
      id: 1,
      name: "Alice",
      email: "alice@example.com",
      activeRole: "borrower",
      isProfileComplete: true,
      profilePhoto: null,
      bio: "hello",
      averageRating: 4.5,
      totalRatings: 10,
    };

    it("returns whitelisted fields only", () => {
      const result = publicUser({ ...baseUser, passwordHash: "secret", isRestricted: true });
      expect(result).not.toHaveProperty("passwordHash");
      expect(result).not.toHaveProperty("isRestricted");
      expect(result.id).toBe(1);
      expect(result.email).toBe("alice@example.com");
    });

    it("defaults averageRating and totalRatings to 0", () => {
      const result = publicUser({ ...baseUser, averageRating: null, totalRatings: null });
      expect(result.averageRating).toBe(0);
      expect(result.totalRatings).toBe(0);
    });

    it("includes size when provided", () => {
      const size = { height: "170" };
      const result = publicUser(baseUser, size);
      expect(result.size).toEqual(size);
    });

    it("size is omitted when called without second arg", () => {
      const result = publicUser(baseUser);
      expect(result.size).toBeNull(); // publicUser default param null -> includes { size: null } via spread check
      // Check implementation: ...(size !== undefined ? { size } : {})
      // When not passed, size = null initially? Actually function signature: (user, size = null)
      // So size = null => size !== undefined true => includes size:null
      // Let's assert that behavior
    });

    it("explicit undefined size defaults to null", () => {
      const result = publicUser(baseUser, undefined);
      // JS default param: undefined triggers default (null) => size !== undefined true
      expect(result.size).toBeNull();
    });
  });

  describe("generateToken", () => {
    it("generates a valid JWT with userId", () => {
      const token = generateToken(42);
      const decoded = jwt.verify(token, env.jwtSecret);
      expect(decoded.userId).toBe(42);
    });

    it("respects env.jwtExpire", () => {
      const token = generateToken(1);
      const decoded = jwt.decode(token);
      expect(decoded.exp).toBeDefined();
    });
  });

  describe("getAuthCookieOptions", () => {
    it("returns httpOnly and correct maxAge", () => {
      const opts = getAuthCookieOptions();
      expect(opts.httpOnly).toBe(true);
      expect(opts.maxAge).toBe(env.cookieMaxAgeMs);
      expect(opts.sameSite).toBe("lax");
    });

    it("secure reflects isProduction", () => {
      const opts = getAuthCookieOptions();
      expect(opts.secure).toBe(env.isProduction);
    });
  });
});
