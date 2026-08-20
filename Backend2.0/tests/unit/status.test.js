import { describe, it, expect } from "vitest";
import {
  ITEM_STATUS,
  ITEM_TOGGLE_STATUS,
  BORROW_STATUS,
  BORROW_TRANSITIONS,
  COMPETING_STATUSES,
  canTransitionBorrow,
} from "../../src/shared/constants/status.js";

describe("shared/constants/status", () => {
  it("ITEM_STATUS frozen values", () => {
    expect(ITEM_STATUS.AVAILABLE).toBe("Available");
    expect(ITEM_STATUS.BORROWED).toBe("Borrowed");
    expect(ITEM_STATUS.UNAVAILABLE).toBe("Unavailable");
  });

  it("ITEM_TOGGLE_STATUS only Available/Unavailable", () => {
    expect(ITEM_TOGGLE_STATUS).toEqual(["Available", "Unavailable"]);
    expect(ITEM_TOGGLE_STATUS).not.toContain("Borrowed");
  });

  it("COMPETING_STATUSES includes pending & approved", () => {
    expect(COMPETING_STATUSES).toEqual(["pending", "approved"]);
  });

  describe("canTransitionBorrow", () => {
    it("allows lender pending -> approved", () => {
      expect(canTransitionBorrow("pending", "approved", "lender")).toEqual({ ok: true });
    });

    it("allows lender pending -> rejected", () => {
      expect(canTransitionBorrow("pending", "rejected", "lender")).toEqual({ ok: true });
    });

    it("allows borrower pending -> cancelled", () => {
      expect(canTransitionBorrow("pending", "cancelled", "borrower")).toEqual({ ok: true });
    });

    it("rejects borrower pending -> approved", () => {
      const r = canTransitionBorrow("pending", "approved", "borrower");
      expect(r.ok).toBe(false);
      expect(r.message).toMatch(/Cannot move/);
    });

    it("allows lender approved -> agreement_pending", () => {
      expect(canTransitionBorrow("approved", "agreement_pending", "lender")).toEqual({ ok: true });
    });

    it("allows borrower agreement_pending -> borrowed", () => {
      expect(canTransitionBorrow("agreement_pending", "borrowed", "borrower")).toEqual({
        ok: true,
      });
    });

    it("allows lender borrowed -> returned", () => {
      expect(canTransitionBorrow("borrowed", "returned", "lender")).toEqual({ ok: true });
    });

    it("allows both to rate after returned", () => {
      expect(canTransitionBorrow("returned", "rated", "lender")).toEqual({ ok: true });
      expect(canTransitionBorrow("returned", "rated", "borrower")).toEqual({ ok: true });
    });

    it("rejects no transitions from rejected", () => {
      const r = canTransitionBorrow("rejected", "approved", "lender");
      expect(r.ok).toBe(false);
      expect(r.message).toMatch(/No transitions/);
    });

    it("rejects unknown current status", () => {
      const r = canTransitionBorrow("unknown", "pending", "lender");
      expect(r.ok).toBe(false);
    });

    it("all defined transitions are valid", () => {
      // exhaustive check of BORROW_TRANSITIONS map
      for (const [from, actors] of Object.entries(BORROW_TRANSITIONS)) {
        for (const [actor, tos] of Object.entries(actors)) {
          for (const to of tos) {
            expect(canTransitionBorrow(from, to, actor)).toEqual({ ok: true });
          }
        }
      }
    });
  });
});
