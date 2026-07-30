const normalizeError = (err) => {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
      cause: err.cause ? normalizeError(err.cause) : undefined,
    };
  }

  return {
    name: "UnknownError",
    message: String(err),
    stack: undefined,
    cause: undefined,
  };
};

export { normalizeError };
