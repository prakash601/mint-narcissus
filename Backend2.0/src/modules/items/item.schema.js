import {
  pgSchema,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { users } from "../auth/auth.schema.js";

const catalogSchema = pgSchema("catalog");

export const items = catalogSchema.table(
  "items",
  {
    id: serial("id").primaryKey(),
    lenderId: integer("lender_id")
      .notNull()
      .references(() => users.id),
    title: varchar("title", { length: 255 }),
    description: text("description"),
    lenderDetails: jsonb("lender_details"),
    category: varchar("category", { length: 100 }).notNull(),
    sizeLabel: varchar("size_label", { length: 50 }).notNull(),
    interviewTypes: text("interview_type").array().notNull(),
    fabricType: varchar("fabric_type", { length: 100 }),
    confidenceNote: text("confidence_note"),
    status: varchar("status", { length: 50 }).default("Available").notNull(),
    images: text("images").array().notNull(),
    measurements: jsonb("measurements").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    statusIdx: index("items_status_idx").on(table.status),
    lenderIdx: index("items_lender_id_idx").on(table.lenderId),
    statusCreatedIdx: index("items_status_created_idx").on(table.status, table.createdAt),
    categoryIdx: index("items_category_idx").on(table.category),
  }),
);

export const savedItems = catalogSchema.table(
  "saved_items",
  {
    id: serial("id").primaryKey(),
    borrowerId: integer("borrower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    itemId: integer("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    uniqueIdx: uniqueIndex("saved_items_borrower_item_key").on(
      table.borrowerId,
      table.itemId,
    ),
    borrowerIdx: index("saved_items_borrower_id_idx").on(table.borrowerId),
  }),
);

export { catalogSchema };
