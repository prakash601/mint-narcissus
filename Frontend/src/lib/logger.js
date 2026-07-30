let _correlationId = null;
let _userId = null;

export function setCorrelationId(id) {
  _correlationId = id;
}

export function getCorrelationId() {
  return _correlationId;
}

export function setUserId(id) {
  _userId = id;
}

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel =
  LOG_LEVELS[import.meta.env.VITE_LOG_LEVEL] ??
  (import.meta.env.PROD ? LOG_LEVELS.info : LOG_LEVELS.debug);

const REDACTED_KEYS = new Set([
  "password",
  "token",
  "secret",
  "accessToken",
  "refreshToken",
  "authorization",
  "cookie",
]);

function redact(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const result = Array.isArray(obj) ? [...obj] : { ...obj };
  for (const key in result) {
    if (REDACTED_KEYS.has(key)) {
      result[key] = "[REDACTED]";
    } else if (typeof result[key] === "object" && result[key] !== null) {
      result[key] = redact(result[key]);
    }
  }
  return result;
}

function serializeError(err) {
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack };
  }
  return { name: "UnknownError", message: String(err) };
}

export function createLogger(name) {
  function log(level, msg, second, third) {
    if (LOG_LEVELS[level] < currentLevel) return;

    const data = {};

    if (_correlationId) data.correlationId = _correlationId;
    if (_userId) data.userId = _userId;

    if (second instanceof Error) {
      data.error = serializeError(second);
      if (third && typeof third === "object") {
        if (third.meta) data.meta = third.meta;
        if (third.request) data.request = third.request;
      }
    } else if (second && typeof second === "object") {
      if (second.meta) data.meta = second.meta;
      if (second.request) data.request = second.request;
    }

    const redactedData = redact(data);
    const timestamp = new Date().toISOString();

    if (import.meta.env.PROD) {
      const line = JSON.stringify({ timestamp, level, name, msg, ...redactedData });
      if (level === "error") console.error(line);
      else if (level === "warn") console.warn(line);
      else console.log(line);
    } else {
      import.meta.hot?.send("terminal:log", {
        timestamp,
        level,
        name,
        msg,
        ...redactedData,
      });
    }
  }

  return {
    debug: (msg, second, third) => log("debug", msg, second, third),
    info: (msg, second, third) => log("info", msg, second, third),
    warn: (msg, second, third) => log("warn", msg, second, third),
    error: (msg, second, third) => log("error", msg, second, third),
  };
}
