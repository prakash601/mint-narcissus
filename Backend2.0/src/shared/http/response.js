/**
 * Consistent JSON response helpers.
 */

export function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, ...normalizePayload(data) });
}

export function created(res, data) {
  return ok(res, data, 201);
}

function normalizePayload(data) {
  if (data === null || data === undefined) {
    return { data: null };
  }
  // Already shaped as { user } / { data } / { requests, pagination } etc.
  if (typeof data === "object" && !Array.isArray(data)) {
    return data;
  }
  return { data };
}

export default { ok, created };
