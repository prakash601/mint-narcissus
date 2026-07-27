const createHttpLogger = (logger) => {
  return (req, res, next) => {
    if (req.path === "/health") return next();

    const start = Date.now();
    logger.debug("HTTP request started", {
      request: {
        method: req.method,
        path: req.originalUrl || req.url,
      },
    });

    res.on("finish", () => {
      const latencyMs = Date.now() - start;
      const level =
        res.statusCode >= 500
          ? "error"
          : res.statusCode >= 400
            ? "warn"
            : "info";

      logger[level]("HTTP request completed", {
        request: {
          method: req.method,
          path: req.originalUrl || req.url,
          status: res.statusCode,
          latencyMs,
        },
      });
    });

    next();
  };
};

export { createHttpLogger };
