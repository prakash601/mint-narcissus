import {
  pgSchema,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { users } from "../auth/auth.schema.js";
import { items } from "../items/item.schema.js";

const rentalSchema = pgSchema("rental");

export const borrowRequests = rentalSchema.table(
  "borrow_requests",
  {
    id: serial("id").primaryKey(),
    itemId: integer("item_id")
      .notNull()
      .references(() => items.id),
    borrowerId: integer("borrower_id")
      .notNull()
      .references(() => users.id),
    lenderId: integer("lender_id")
      .notNull()
      .references(() => users.id),
    status: varchar("status", { length: 50 }).default("pending").notNull(),
    agreementAcceptedAt: timestamp("agreement_accepted_at", { withTimezone: true }),
    borrowedAt: timestamp("borrowed_at", { withTimezone: true }),
    returnedAt: timestamp("returned_at", { withTimezone: true }),
    ratingsPending: boolean("ratings_pending").default(false),
    lenderRated: boolean("lender_rated").default(false),
    borrowerRated: boolean("borrower_rated").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    itemIdx: index("borrow_requests_item_id_idx").on(table.itemId),
    borrowerIdx: index("borrow_requests_borrower_id_idx").on(table.borrowerId),
    lenderIdx: index("borrow_requests_lender_id_idx").on(table.lenderId),
    statusIdx: index("borrow_requests_status_idx").on(table.status),
    lenderStatusIdx: index("borrow_requests_lender_status_idx").on(
      table.lenderId,
      table.status,
    ),
    borrowerStatusIdx: index("borrow_requests_borrower_status_idx").on(
      table.borrowerId,
      table.status,
    ),
  }),
);

export const conversations = rentalSchema.table(
  "conversations",
  {
    id: serial("id").primaryKey(),
    borrowRequestId: integer("borrow_request_id")
      .notNull()
      .unique()
      .references(() => borrowRequests.id, { onDelete: "cascade" }),
    isActive: boolean("is_active").default(true),
    lastMessage: text("last_message"),
    isRead: boolean("is_read").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    activeIdx: index("conversations_is_active_idx").on(table.isActive),
  }),
);

export const messages = rentalSchema.table(
  "messages",
  {
    id: serial("id").primaryKey(),
    conversationId: integer("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: integer("sender_id")
      .notNull()
      .references(() => users.id),
    messageText: text("message_text").notNull(),
    isSystemMessage: boolean("is_system_message").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    conversationIdx: index("messages_conversation_id_idx").on(table.conversationId),
    conversationCreatedIdx: index("messages_conversation_created_idx").on(
      table.conversationId,
      table.createdAt,
    ),
  }),
);

/** One score per rater per borrow request; ratee is the other party */
export const ratings = rentalSchema.table(
  "ratings",
  {
    id: serial("id").primaryKey(),
    borrowRequestId: integer("borrow_request_id")
      .notNull()
      .references(() => borrowRequests.id, { onDelete: "cascade" }),
    raterId: integer("rater_id")
      .notNull()
      .references(() => users.id),
    rateeId: integer("ratee_id")
      .notNull()
      .references(() => users.id),
    score: integer("score").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    uniqueRater: uniqueIndex("ratings_request_rater_key").on(
      table.borrowRequestId,
      table.raterId,
    ),
    rateeIdx: index("ratings_ratee_id_idx").on(table.rateeId),
  }),
);

export { rentalSchema };
