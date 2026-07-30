import {
  pgSchema,
  serial,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  real,
  index,
} from "drizzle-orm/pg-core";

const authSchema = pgSchema("auth");

export const users = authSchema.table(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }),
    role: varchar("role", { length: 50 }).default("user"),
    linkedinId: varchar("linkedin_id", { length: 255 }).unique(),
    profilePhoto: text("profile_photo"),
    bio: text("bio"),
    activeRole: varchar("active_role", { length: 50 }).default("borrower"),
    isProfileComplete: boolean("is_profile_complete").default(false),
    isRestricted: boolean("is_restricted").default(false),
    averageRating: real("average_rating").notNull().default(0),
    totalRatings: integer("total_ratings").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    activeRoleIdx: index("users_active_role_idx").on(table.activeRole),
  }),
);

export const userSizes = authSchema.table("user_sizes", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  height: varchar("height", { length: 50 }),
  fitType: varchar("fit_type", { length: 50 }),
  topSize: varchar("top_size", { length: 50 }),
  bottomSize: varchar("bottom_size", { length: 50 }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export { authSchema };
