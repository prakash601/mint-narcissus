import { als } from "../context.js";

const requestContext = (req, _res, next) => {
  const correlationId = req.headers["x-request-id"] || null;
  const userId =
    req.headers["x-user-id"] ||
    req.user?._id?.toString() ||
    null;

  als.run({ correlationId, userId }, next);
};

export { requestContext };
