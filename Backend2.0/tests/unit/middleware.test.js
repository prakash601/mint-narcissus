import { describe, it, expect, vi } from "vitest";
import { ZodError } from "zod";
import { AppError } from "../../src/shared/errors/AppError.js";
import { errorHandler, notFoundHandler } from "../../src/middleware/errorHandler.js";
import { validate } from "../../src/middleware/validate.js";
import { z } from "zod";

describe("middleware - validate", () => {
  it("parses body and calls next", () => {
    const schema = z.object({ name: z.string().min(1) });
    const mw = validate({ body: schema });
    const req = { body: { name: "Alice" }, query: {}, params: {} };
    const next = vi.fn();
    mw(req, {}, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.body.name).toBe("Alice");
  });

  it("forwards ZodError on invalid body", () => {
    const schema = z.object({ name: z.string().min(1) });
    const mw = validate({ body: schema });
    const req = { body: { name: "" }, query: {}, params: {}, url: "/test", method: "POST" };
    const next = vi.fn();
    mw(req, {}, next);
    expect(next).toHaveBeenCalledWith(expect.any(ZodError));
  });

  it("parses query with coercion", () => {
    const schema = z.object({ page: z.coerce.number().int() });
    const mw = validate({ query: schema });
    const req = { body: {}, query: { page: "2" }, params: {} };
    const next = vi.fn();
    mw(req, {}, next);
    expect(req.query.page).toBe(2);
    expect(next).toHaveBeenCalledWith();
  });

  it("parses params", () => {
    const schema = z.object({ id: z.coerce.number().int() });
    const mw = validate({ params: schema });
    const req = { body: {}, query: {}, params: { id: "5" } };
    const next = vi.fn();
    mw(req, {}, next);
    expect(req.params.id).toBe(5);
  });
});

describe("middleware - errorHandler", () => {
  function mockRes() {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  }

  it("handles ZodError with 400", () => {
    const zodErr = new ZodError([
      { path: ["email"], message: "Invalid email", code: "invalid_string" },
    ]);
    const res = mockRes();
    errorHandler(zodErr, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, code: "VALIDATION_ERROR" }),
    );
  });

  it("handles AppError", () => {
    const err = AppError.notFound("Missing");
    const res = mockRes();
    errorHandler(err, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Missing", code: "NOT_FOUND" }),
    );
  });

  it("handles MulterError", () => {
    const err = new Error("Too many files");
    err.name = "MulterError";
    const res = mockRes();
    errorHandler(err, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: "UPLOAD_ERROR" }));
  });

  it("handles generic 500", () => {
    const err = new Error("boom");
    const res = mockRes();
    errorHandler(err, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: "INTERNAL_ERROR" }));
  });
});

describe("middleware - notFoundHandler", () => {
  it("returns 404", () => {
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    notFoundHandler({}, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: "NOT_FOUND" }));
  });
});
