import { randomUUID } from "node:crypto";

const correlationId = (req, res, next) => {
  const id = req.headers["x-request-id"] || randomUUID();
  req.headers["x-request-id"] = id;
  res.setHeader("x-request-id", id);
  next();
};

export { correlationId };
