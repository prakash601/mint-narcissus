import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { validateEnv, env } = await import("./config/env.js");
validateEnv();

const http = await import("node:http");
const { Server } = await import("socket.io");
const { default: app } = await import("./app.js");
const { connectDB } = await import("./config/database.js");
const { default: initSocketEngine } = await import("./modules/rental/socket.handler.js");
const { createLogger } = await import("./shared/logger/index.js");

const logger = createLogger("server-runtime");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.clientUrl,
    credentials: true,
  },
});

app.set("io", io);

app.use((req, res, next) => {
  req.io = io;
  next();
});

initSocketEngine(io);

async function bootSystem() {
  try {
    await connectDB();
    server.listen(env.port, () => {
      logger.info(`System startup successful. Server listening on port ${env.port}`);
    });
  } catch (error) {
    logger.error("System boot failed", error);
    process.exit(1);
  }
}

bootSystem();
