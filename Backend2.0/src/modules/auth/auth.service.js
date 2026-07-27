import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../../config/database.js";
import { env } from "../../config/env.js";
import { AppError } from "../../shared/errors/AppError.js";
import { users, userSizes } from "./auth.schema.js";

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    maxAge: env.cookieMaxAgeMs,
  };
}

export function generateToken(userId) {
  return jwt.sign({ userId }, env.jwtSecret, {
    expiresIn: env.jwtExpire,
  });
}

export function publicUser(user, size = null) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    activeRole: user.activeRole,
    isProfileComplete: user.isProfileComplete,
    profilePhoto: user.profilePhoto,
    bio: user.bio,
    averageRating: user.averageRating ?? 0,
    totalRatings: user.totalRatings ?? 0,
    ...(size !== undefined ? { size } : {}),
  };
}

async function getUserSize(userId) {
  const rows = await db.select().from(userSizes).where(eq(userSizes.userId, userId));
  return rows.length > 0 ? rows[0] : null;
}

export async function registerUser({ name, email, password }) {
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    throw AppError.conflict("Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(users).values({ name, email, passwordHash }).returning();

  return {
    token: generateToken(user.id),
    user: publicUser(user),
  };
}

export async function loginUser({ email, password }) {
  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user || !user.passwordHash) {
    throw AppError.unauthorized("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw AppError.unauthorized("Invalid credentials");
  }

  if (user.isRestricted) {
    throw AppError.forbidden("Account restricted. Contact support.");
  }

  return {
    token: generateToken(user.id),
    user: publicUser(user),
  };
}

export async function getCurrentUser(userId) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) {
    throw AppError.notFound("User not found");
  }

  const size = await getUserSize(user.id);
  return { user: publicUser(user, size) };
}

export async function updateCurrentUser(userId, payload) {
  const { activeRole, size, bio, profilePhoto } = payload;

  const updates = {
    isProfileComplete: true,
    updatedAt: new Date(),
  };

  if (activeRole) updates.activeRole = activeRole;
  if (bio !== undefined) updates.bio = bio;
  if (profilePhoto !== undefined) updates.profilePhoto = profilePhoto || null;

  const [user] = await db.update(users).set(updates).where(eq(users.id, userId)).returning();

  if (!user) {
    throw AppError.notFound("User not found");
  }

  if (size !== undefined) {
    const sizePayload = {};
    for (const key of ["height", "fitType", "topSize", "bottomSize"]) {
      if (key in size) sizePayload[key] = size[key];
    }

    await db
      .insert(userSizes)
      .values({ userId: user.id, ...sizePayload })
      .onConflictDoUpdate({
        target: userSizes.userId,
        set: { ...sizePayload, updatedAt: sql`NOW()` },
      });
  }

  const sizeData = await getUserSize(user.id);
  return { user: publicUser(user, sizeData) };
}

export function issueLinkedInToken(user) {
  return generateToken(user.id);
}
