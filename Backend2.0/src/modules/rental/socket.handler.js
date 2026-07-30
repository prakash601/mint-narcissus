import jwt from "jsonwebtoken";
import cookie from "cookie";
import { createLogger } from "../../shared/logger/index.js";
import { als } from "../../shared/logger/context.js";
import { env } from "../../config/env.js";
import { userCanAccessConversation } from "./rental.service.js";

const logger = createLogger("rental-module");

const onlineUsers = new Map();

export default (io) => {
  io.use((socket, next) => {
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
      return next(new Error("Not authenticated."));
    }

    const cookies = cookie.parse(cookieHeader);

    if (!cookies.token) {
      return next(new Error("Not authenticated."));
    }

    try {
      const decoded = jwt.verify(cookies.token, env.jwtSecret);
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error("Invalid token."));
    }
  });

  io.on("connection", (socket) => {
    als.run({ correlationId: socket.id, userId: socket.userId }, () => {
      logger.info("Socket connected");
    });

    socket.on("join_conversation", async (conversationId, ack) => {
      try {
        const id = Number(conversationId);
        if (!Number.isInteger(id) || id < 1) {
          const err = { ok: false, message: "Invalid conversation id" };
          if (typeof ack === "function") ack(err);
          return;
        }

        const allowed = await userCanAccessConversation(socket.userId, id);
        if (!allowed) {
          const err = { ok: false, message: "Access denied" };
          if (typeof ack === "function") ack(err);
          return;
        }

        const room = String(id);
        socket.join(room);

        if (!onlineUsers.has(room)) {
          onlineUsers.set(room, new Set());
        }

        const alreadyOnline = [...onlineUsers.get(room)];
        onlineUsers.get(room).add(socket.userId);

        socket.to(room).emit("user_online", { userId: socket.userId });
        alreadyOnline.forEach((userId) => {
          socket.emit("user_online", { userId });
        });

        if (typeof ack === "function") {
          ack({ ok: true, conversationId: id });
        }
      } catch (err) {
        logger.error("join_conversation failed", err);
        if (typeof ack === "function") {
          ack({ ok: false, message: "Failed to join conversation" });
        }
      }
    });

    socket.on("leave_conversation", (conversationId) => {
      const room = String(conversationId);
      socket.leave(room);

      if (onlineUsers.has(room)) {
        onlineUsers.get(room).delete(socket.userId);
      }

      socket.to(room).emit("user_offline", {
        userId: socket.userId,
      });
    });

    socket.on("disconnect", () => {
      onlineUsers.forEach((users, conversationId) => {
        if (users.has(socket.userId)) {
          users.delete(socket.userId);
          socket.to(conversationId).emit("user_offline", {
            userId: socket.userId,
          });
        }
      });

      als.run({ correlationId: socket.id, userId: socket.userId }, () => {
        logger.info("Socket disconnected");
      });
    });
  });
};
