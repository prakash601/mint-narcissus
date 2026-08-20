import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { createLogger } from "../shared/logger/index.js";
import { env } from "./env.js";

const logger = createLogger("database");

let _pool = null;
let _db = null;

function getPoolInternal() {
  if (_pool) return _pool;
  // Lazy init: only create after env is validated (server.js validates before importing app.js)
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is not configured. Set it in .env before starting the server.");
  }
  _pool = new Pool({
    connectionString: env.databaseUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  _pool.on("error", (err) => {
    logger.error("Unexpected error on idle client", err);
  });
  return _pool;
}

function getDbInternal() {
  if (_db) return _db;
  _db = drizzle(getPoolInternal());
  return _db;
}

// Proxies keep `import { pool, db }` working while deferring creation
// until first use (after validateEnv). This prevents Pool(undefined) at
// import time during tests or mis-ordered imports.
export const pool = new Proxy(
  {},
  {
    get(_target, prop) {
      const p = getPoolInternal();
      const val = p[prop];
      return typeof val === "function" ? val.bind(p) : val;
    },
    has(_target, prop) {
      return prop in getPoolInternal();
    },
  },
);

export const db = new Proxy(
  {},
  {
    get(_target, prop) {
      const d = getDbInternal();
      const val = d[prop];
      return typeof val === "function" ? val.bind(d) : val;
    },
    has(_target, prop) {
      return prop in getDbInternal();
    },
  },
);

export const connectDB = async () => {
  try {
    const client = await getPoolInternal().connect();
    await client.query("SELECT 1");
    client.release();
    logger.info("PostgreSQL connected successfully");
  } catch (error) {
    logger.error("PostgreSQL connection failed", error);
    throw error;
  }
};

export const closePool = async () => {
  if (_pool) {
    await _pool.end();
    _pool = null;
    _db = null;
  }
};
