import { createLogger } from "../shared/logger/index.js";

const log = createLogger("validate");

/**
 * Validate request body / query / params with Zod schemas.
 * Parsed (coerced) values are written back onto the request.
 *
 * @param {{ body?: import('zod').ZodTypeAny, query?: import('zod').ZodTypeAny, params?: import('zod').ZodTypeAny }} schemas
 */
export function validate(schemas) {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body ?? {});
      }

      if (schemas.query) {
        const parsed = schemas.query.parse(req.query ?? {});
        for (const key of Object.keys(req.query)) {
          delete req.query[key];
        }
        Object.assign(req.query, parsed);
      }

      if (schemas.params) {
        const parsed = schemas.params.parse(req.params ?? {});
        for (const key of Object.keys(req.params)) {
          delete req.params[key];
        }
        Object.assign(req.params, parsed);
      }

      next();
    } catch (err) {
      log.warn("Validation failed", {
        request: { path: req.originalUrl || req.url, method: req.method },
        meta: { issues: err.issues },
      });
      next(err);
    }
  };
}

export default validate;
