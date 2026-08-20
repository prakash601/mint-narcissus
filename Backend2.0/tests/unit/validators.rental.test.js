import { describe, it, expect } from "vitest";
import {
  createRequestBodySchema,
  listRequestsQuerySchema,
  messagesQuerySchema,
  sendMessageBodySchema,
  submitRatingBodySchema,
} from "../../src/modules/rental/rental.validators.js";

describe("rental.validators", () => {
  describe("createRequestBodySchema", () => {
    it("accepts valid outfitId", () => {
      expect(createRequestBodySchema.parse({ outfitId: 1 })).toEqual({ outfitId: 1 });
    });
    it("coerces string outfitId", () => {
      expect(createRequestBodySchema.parse({ outfitId: "5" })).toEqual({ outfitId: 5 });
    });
    it("rejects zero or negative", () => {
      expect(() => createRequestBodySchema.parse({ outfitId: 0 })).toThrow();
      expect(() => createRequestBodySchema.parse({ outfitId: -1 })).toThrow();
    });
  });

  describe("listRequestsQuerySchema", () => {
    it("defaults page/limit", () => {
      const parsed = listRequestsQuerySchema.parse({});
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(20);
    });
    it("accepts valid status", () => {
      expect(listRequestsQuerySchema.parse({ status: "pending" }).status).toBe("pending");
      expect(listRequestsQuerySchema.parse({ status: "borrowed" }).status).toBe("borrowed");
    });
    it("rejects invalid status", () => {
      expect(() => listRequestsQuerySchema.parse({ status: "invalid" })).toThrow();
    });
    it("rejects limit >50", () => {
      expect(() => listRequestsQuerySchema.parse({ limit: 100 })).toThrow();
    });
  });

  describe("messagesQuerySchema", () => {
    it("defaults limit 30", () => {
      expect(messagesQuerySchema.parse({}).limit).toBe(30);
    });
    it("rejects limit >100", () => {
      expect(() => messagesQuerySchema.parse({ limit: 200 })).toThrow();
    });
  });

  describe("sendMessageBodySchema", () => {
    it("accepts valid text", () => {
      expect(sendMessageBodySchema.parse({ text: "Hello" })).toEqual({ text: "Hello" });
    });
    it("trims text", () => {
      expect(sendMessageBodySchema.parse({ text: "  Hello  " }).text).toBe("Hello");
    });
    it("rejects empty", () => {
      expect(() => sendMessageBodySchema.parse({ text: "" })).toThrow();
      expect(() => sendMessageBodySchema.parse({ text: "   " })).toThrow();
    });
    it("rejects over 5000 chars", () => {
      expect(() => sendMessageBodySchema.parse({ text: "a".repeat(5001) })).toThrow();
    });
  });

  describe("submitRatingBodySchema", () => {
    it("accepts 1-5", () => {
      for (let i = 1; i <= 5; i++) {
        expect(submitRatingBodySchema.parse({ rating: i }).rating).toBe(i);
      }
    });
    it("coerces string rating", () => {
      expect(submitRatingBodySchema.parse({ rating: "3" }).rating).toBe(3);
    });
    it("rejects 0 and 6", () => {
      expect(() => submitRatingBodySchema.parse({ rating: 0 })).toThrow();
      expect(() => submitRatingBodySchema.parse({ rating: 6 })).toThrow();
    });
    it("rejects float", () => {
      expect(() => submitRatingBodySchema.parse({ rating: 3.5 })).toThrow();
    });
  });
});
