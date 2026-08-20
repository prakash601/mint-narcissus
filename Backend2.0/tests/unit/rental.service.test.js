import { describe, it, expect } from "vitest";
import { computeNewAverage } from "../../src/modules/rental/rental.service.js";

describe("rental.service - computeNewAverage", () => {
  it("computes average from scratch", () => {
    const result = computeNewAverage(0, 0, 5);
    expect(result).toEqual({ averageRating: 5, totalRatings: 1 });
  });

  it("computes running average", () => {
    // current avg 4 with 2 ratings, new score 5 => (4*2+5)/3 = 4.33
    const result = computeNewAverage(4, 2, 5);
    expect(result.totalRatings).toBe(3);
    expect(result.averageRating).toBeCloseTo(4.33, 2);
  });

  it("handles null/undefined inputs as 0", () => {
    const result = computeNewAverage(null, null, 4);
    expect(result).toEqual({ averageRating: 4, totalRatings: 1 });
  });

  it("handles string numbers", () => {
    const result = computeNewAverage("4.5", "2", 5);
    expect(result.totalRatings).toBe(3);
    expect(result.averageRating).toBeCloseTo(4.67, 2);
  });

  it("rounds to 2 decimals", () => {
    // (4.33*1 + 4)/2 = 4.165 => 4.17
    const result = computeNewAverage(4.33, 1, 4);
    expect(result.averageRating).toBe(4.17);
  });

  it("sequential ratings produce correct average", () => {
    let avg = 0;
    let total = 0;
    const scores = [5, 3, 4];
    for (const score of scores) {
      const next = computeNewAverage(avg, total, score);
      avg = next.averageRating;
      total = next.totalRatings;
    }
    // (5+3+4)/3 = 4
    expect(avg).toBeCloseTo(4, 1);
    expect(total).toBe(3);
  });
});
