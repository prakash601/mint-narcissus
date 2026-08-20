import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../config/database.js";
import { env } from "../config/env.js";
import { AppError } from "../shared/errors/AppError.js";
import { setContextUserId } from "../shared/logger/middleware/requestContext.js";
import { users } from "../modules/auth/auth.schema.js";

const auth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      throw AppError.unauthorized("Not authenticated. Please login.");
    }

    const decoded = jwt.verify(token, env.jwtSecret);
    const [user] = await db.select().from(users).where(eq(users.id, decoded.userId));

    if (!user) {
      throw AppError.unauthorized("User not found. Please login again.");
    }

    if (user.isRestricted) {
      throw AppError.forbidden(
        "Your account has been restricted. Please contact support.",
      );
    }

    req.user = user;
    setContextUserId(user.id);
    next();
  } catch (err) {
    if (err instanceof AppError) {
      return next(err);
    }
    return next(AppError.unauthorized("Invalid or expired token. Please login again."));
  }
};

const requireProfileComplete = (req, res, next) => {
  if (!req.user?.isProfileComplete) {
    return next(
      AppError.forbidden("Please complete your profile before continuing."),
    );
  }
  next();
};

const requireRole = (role) => (req, res, next) => {
  if (req.user?.activeRole !== role) {
    return next(
      AppError.forbidden(
        `This action requires the ${role} role. Switch your active role to continue.`,
      ),
    );
  }
  next();
};

export { auth, requireProfileComplete, requireRole };
