import baseLogger from "./baseLogger.js";
import { getContext } from "./context.js";
import { normalizeError } from "./helpers/logError.js";

function createLogger(serviceName) {
  const child = baseLogger.child({
    service: serviceName,
    env: process.env.NODE_ENV || "development",
  });

  function createChildLogger(bindings) {
    const log = (level, msg, second, third) => {
      const { correlationId, userId } = getContext();
      const data = {};

      if (correlationId) data.correlationId = correlationId;
      if (userId) data.userId = userId;

      if (second instanceof Error) {
        data.error = normalizeError(second);
        if (third && typeof third === "object") {
          if (third.meta) data.meta = third.meta;
          if (third.request) data.request = third.request;
        }
      } else if (second && typeof second === "object") {
        if (second.meta) data.meta = second.meta;
        if (second.request) data.request = second.request;
      }

      child[level]({ ...bindings, ...data }, msg);
    };

    return {
      debug: (msg, second, third) => log("debug", msg, second, third),
      info: (msg, second, third) => log("info", msg, second, third),
      warn: (msg, second, third) => log("warn", msg, second, third),
      error: (msg, second, third) => log("error", msg, second, third),
    };
  }

  const log = (level, msg, second, third) => {
    const { correlationId, userId } = getContext();
    const data = {};

    if (correlationId) data.correlationId = correlationId;
    if (userId) data.userId = userId;

    if (second instanceof Error) {
      data.error = normalizeError(second);
      if (third && typeof third === "object") {
        if (third.meta) data.meta = third.meta;
        if (third.request) data.request = third.request;
      }
    } else if (second && typeof second === "object") {
      if (second.meta) data.meta = second.meta;
      if (second.request) data.request = second.request;
    }

    child[level](data, msg);
  };

  return {
    debug: (msg, second, third) => log("debug", msg, second, third),
    info: (msg, second, third) => log("info", msg, second, third),
    warn: (msg, second, third) => log("warn", msg, second, third),
    error: (msg, second, third) => log("error", msg, second, third),
    child: (bindings) => createChildLogger(bindings),
  };
}

export { createLogger };
