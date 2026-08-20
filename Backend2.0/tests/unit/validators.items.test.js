import { describe, it, expect } from "vitest";
import {
  feedQuerySchema,
  createItemBodySchema,
  updateItemStatusBodySchema,
  idParamSchema,
} from "../../src/modules/items/item.validators.js";

describe("items.validators", () => {
  describe("idParamSchema", () => {
    it("coerces string id to number", () => {
      expect(idParamSchema.parse({ id: "42" })).toEqual({ id: 42 });
    });
    it("rejects negative id", () => {
      expect(() => idParamSchema.parse({ id: "-1" })).toThrow();
    });
    it("rejects non-numeric", () => {
      expect(() => idParamSchema.parse({ id: "abc" })).toThrow();
    });
  });

  describe("feedQuerySchema", () => {
    it("defaults page and limit", () => {
      const parsed = feedQuerySchema.parse({});
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(10);
    });

    it("accepts filters", () => {
      const parsed = feedQuerySchema.parse({ size: "M", category: "Formal", interviewType: "Tech" });
      expect(parsed.size).toBe("M");
      expect(parsed.category).toBe("Formal");
    });

    it("coerces string limit", () => {
      const parsed = feedQuerySchema.parse({ limit: "5" });
      expect(parsed.limit).toBe(5);
    });

    it("rejects limit over 50", () => {
      expect(() => feedQuerySchema.parse({ limit: 100 })).toThrow();
    });
  });

  describe("createItemBodySchema", () => {
    const valid = {
      title: "Suit",
      description: "Nice suit",
      lenderDetails: '{"name":"Alice"}',
      category: "Formal",
      size: '{"topSize":"M"}',
      interviewTypes: '["Tech"]',
    };

    it("accepts valid payload", () => {
      expect(createItemBodySchema.parse(valid)).toBeTruthy();
    });

    it("rejects missing title", () => {
      const { title, ...rest } = valid;
      expect(() => createItemBodySchema.parse(rest)).toThrow();
    });

    it("accepts optional outfitImageUrl", () => {
      expect(
        createItemBodySchema.parse({ ...valid, outfitImageUrl: "http://example.com/img.jpg" }),
      ).toBeTruthy();
    });

    it("rejects invalid outfitImageUrl", () => {
      expect(() => createItemBodySchema.parse({ ...valid, outfitImageUrl: "not-url" })).toThrow();
    });

    it("accepts measurements as object", () => {
      expect(createItemBodySchema.parse({ ...valid, measurements: { chest: 40 } })).toBeTruthy();
    });

    it("accepts measurements as JSON string", () => {
      expect(createItemBodySchema.parse({ ...valid, measurements: '{"chest":40}' })).toBeTruthy();
    });
  });

  describe("updateItemStatusBodySchema", () => {
    it("accepts Available", () => {
      expect(updateItemStatusBodySchema.parse({ status: "Available" })).toEqual({
        status: "Available",
      });
    });
    it("accepts Unavailable", () => {
      expect(updateItemStatusBodySchema.parse({ status: "Unavailable" })).toBeTruthy();
    });
    it("rejects invalid status", () => {
      expect(() => updateItemStatusBodySchema.parse({ status: "Borrowed" })).toThrow();
    });
  });
});
