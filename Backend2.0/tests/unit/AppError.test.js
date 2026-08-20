import { describe, it, expect } from "vitest";
import { AppError } from "../../src/shared/errors/AppError.js";

describe("AppError", () => {
  it("creates generic error with defaults", () => {
    const err = new AppError("oops");
    expect(err.message).toBe("oops");
    expect(err.statusCode).toBe(400);
    expect(err.isOperational).toBe(true);
    expect(err.name).toBe("AppError");
  });

  it("badRequest has 400 and BAD_REQUEST code", () => {
    const err = AppError.badRequest("bad");
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("BAD_REQUEST");
  });

  it("unauthorized has 401", () => {
    const err = AppError.unauthorized();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("UNAUTHORIZED");
    expect(err.message).toMatch(/Not authenticated/);
  });

  it("forbidden has 403", () => {
    const err = AppError.forbidden("nope");
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe("FORBIDDEN");
  });

  it("notFound has 404", () => {
    const err = AppError.notFound("missing");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
  });

  it("conflict has 409", () => {
    const err = AppError.conflict("exists");
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe("CONFLICT");
  });

  it("stores details", () => {
    const details = { field: "email" };
    const err = AppError.badRequest("bad", details);
    expect(err.details).toEqual(details);
  });

  it("is instance of Error", () => {
    const err = AppError.notFound("x");
    expect(err instanceof Error).toBe(true);
    expect(err instanceof AppError).toBe(true);
  });
});
