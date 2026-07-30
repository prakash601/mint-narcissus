import pino from "pino";
import redactConfig from "./redact.js";

const isProduction = process.env.NODE_ENV === "production";

const logger = pino({
  level:
    process.env.LOG_LEVEL ||
    (isProduction ? "info" : "debug"),
  messageKey: "message",
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  base: null,
  redact: redactConfig,
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          messageKey: "message",
          timestampKey: "timestamp",
          translateTime: false,
          ignore: "pid,hostname,service,env,meta",
          messageFormat:
            "{service} {env} {meta.port} {message}",
        },
      },
});

export default logger;
