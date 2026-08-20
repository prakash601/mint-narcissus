import { describe, it, expect } from "vitest";
import {
  idParamSchema,
  conversationIdParamSchema,
  paginationQuerySchema,
  optionalPaginationQuerySchema,
} from "../../src/shared/validation/common.js";

describe("shared/validation/common", () => {
  describe("idParamSchema", () => {
    it("parses positive int", () => {
      expect(idParamSchema.parse({ id: 1 })).toEqual({ id: 1 });
    });
    it("coerces string", () => {
      expect(idParamSchema.parse({ id: "10" })).toEqual({ id: 10 });
    });
    it("rejects 0", () => {
      expect(() => idParamSchema.parse({ id: 0 })).toThrow();
    });
  });

  describe("conversationIdParamSchema", () => {
    it("parses valid", () => {
      expect(conversationIdParamSchema.parse({ conversationId: 5 })).toEqual({
        conversationId: 5,
      });
    });
    it("coerces string", () => {
      expect(conversationIdParamSchema.parse({ conversationId: "5" })).toEqual({
        conversationId: 5,
      });
    });
  });

  describe("paginationQuerySchema", () => {
    it("defaults", () => {
      expect(paginationQuerySchema.parse({})).toEqual({ page: 1, limit: 20 });
    });
    it("coerces string numbers", () => {
      expect(paginationQuerySchema.parse({ page: "2", limit: "10" })).toEqual({
        page: 2,
        limit: 10,
      });
    });
  });

  describe("optionalPaginationQuerySchema", () => {
    it("defaults when empty", () => {
      const parsed = optionalPaginationQuerySchema.parse({});
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(20);
    });
    it("accepts partial", () => {
      expect(optionalPaginationQuerySchema.parse({ page: 3 }).page).toBe(3);
    });
  });
});
