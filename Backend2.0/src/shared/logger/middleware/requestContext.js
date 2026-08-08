import { als } from "../context.js";

const requestContext = (req, _res, next) => {
  const correlationId = req.headers["x-request-id"] || null;
  als.run({ correlationId, userId: null }, next);
};

export function setContextUserId(userId) {
  const store = als.getStore();
  if (store) {
    store.userId = userId;
  }
}

export { requestContext };
