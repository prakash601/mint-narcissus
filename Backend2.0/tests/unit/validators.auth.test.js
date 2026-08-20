import { describe, it, expect } from "vitest";
import {
  registerBodySchema,
  loginBodySchema,
  updateMeBodySchema,
} from "../../src/modules/auth/auth.validators.js";

describe("auth.validators", () => {
  describe("registerBodySchema", () => {
    it("accepts valid payload", () => {
      const data = { name: "Alice", email: "alice@example.com", password: "password123" };
      expect(registerBodySchema.parse(data)).toEqual(data);
    });

    it("trims name and email", () => {
      const parsed = registerBodySchema.parse({
        name: "  Alice  ",
        email: "  alice@example.com  ",
        password: "password123",
      });
      expect(parsed.name).toBe("Alice");
      expect(parsed.email).toBe("alice@example.com");
    });

    it("rejects empty name", () => {
      expect(() =>
        registerBodySchema.parse({ name: "", email: "a@b.com", password: "password123" }),
      ).toThrow();
    });

    it("rejects invalid email", () => {
      expect(() =>
        registerBodySchema.parse({ name: "Alice", email: "not-email", password: "password123" }),
      ).toThrow();
    });

    it("rejects short password", () => {
      expect(() =>
        registerBodySchema.parse({ name: "Alice", email: "a@b.com", password: "short" }),
      ).toThrow();
    });

    it("rejects missing fields", () => {
      expect(() => registerBodySchema.parse({})).toThrow();
    });
  });

  describe("loginBodySchema", () => {
    it("accepts valid payload", () => {
      expect(loginBodySchema.parse({ email: "a@b.com", password: "secret" })).toEqual({
        email: "a@b.com",
        password: "secret",
      });
    });

    it("rejects missing password", () => {
      expect(() => loginBodySchema.parse({ email: "a@b.com", password: "" })).toThrow();
    });

    it("rejects invalid email", () => {
      expect(() => loginBodySchema.parse({ email: "bad", password: "secret" })).toThrow();
    });
  });

  describe("updateMeBodySchema", () => {
    it("accepts activeRole", () => {
      expect(updateMeBodySchema.parse({ activeRole: "borrower" })).toEqual({
        activeRole: "borrower",
      });
    });

    it("accepts size object", () => {
      const parsed = updateMeBodySchema.parse({ size: { height: "170cm", topSize: "M" } });
      expect(parsed.size.height).toBe("170cm");
    });

    it("rejects empty object", () => {
      expect(() => updateMeBodySchema.parse({})).toThrow(/At least one field/);
    });

    it("rejects invalid activeRole", () => {
      expect(() => updateMeBodySchema.parse({ activeRole: "invalid" })).toThrow();
    });

    it("accepts bio and profilePhoto", () => {
      expect(
        updateMeBodySchema.parse({ bio: "Hello", profilePhoto: "http://example.com/pic.jpg" }),
      ).toBeTruthy();
    });
  });
});
