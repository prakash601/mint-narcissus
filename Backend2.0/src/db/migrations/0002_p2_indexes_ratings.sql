-- User reputation aggregates
ALTER TABLE "auth"."users" ADD COLUMN IF NOT EXISTS "average_rating" real DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "auth"."users" ADD COLUMN IF NOT EXISTS "total_ratings" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_active_role_idx" ON "auth"."users" USING btree ("active_role");
--> statement-breakpoint

-- Catalog indexes
CREATE INDEX IF NOT EXISTS "items_status_idx" ON "catalog"."items" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "items_lender_id_idx" ON "catalog"."items" USING btree ("lender_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "items_status_created_idx" ON "catalog"."items" USING btree ("status", "created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "items_category_idx" ON "catalog"."items" USING btree ("category");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "saved_items_borrower_id_idx" ON "catalog"."saved_items" USING btree ("borrower_id");
--> statement-breakpoint

-- Rental indexes
CREATE INDEX IF NOT EXISTS "borrow_requests_item_id_idx" ON "rental"."borrow_requests" USING btree ("item_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "borrow_requests_borrower_id_idx" ON "rental"."borrow_requests" USING btree ("borrower_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "borrow_requests_lender_id_idx" ON "rental"."borrow_requests" USING btree ("lender_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "borrow_requests_status_idx" ON "rental"."borrow_requests" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "borrow_requests_lender_status_idx" ON "rental"."borrow_requests" USING btree ("lender_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "borrow_requests_borrower_status_idx" ON "rental"."borrow_requests" USING btree ("borrower_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conversations_is_active_idx" ON "rental"."conversations" USING btree ("is_active");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_conversation_id_idx" ON "rental"."messages" USING btree ("conversation_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_conversation_created_idx" ON "rental"."messages" USING btree ("conversation_id", "created_at");
--> statement-breakpoint

-- Ratings table
CREATE TABLE IF NOT EXISTS "rental"."ratings" (
	"id" serial PRIMARY KEY NOT NULL,
	"borrow_request_id" integer NOT NULL,
	"rater_id" integer NOT NULL,
	"ratee_id" integer NOT NULL,
	"score" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "rental"."ratings"
    ADD CONSTRAINT "ratings_borrow_request_id_borrow_requests_id_fk"
    FOREIGN KEY ("borrow_request_id") REFERENCES "rental"."borrow_requests"("id")
    ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "rental"."ratings"
    ADD CONSTRAINT "ratings_rater_id_users_id_fk"
    FOREIGN KEY ("rater_id") REFERENCES "auth"."users"("id")
    ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "rental"."ratings"
    ADD CONSTRAINT "ratings_ratee_id_users_id_fk"
    FOREIGN KEY ("ratee_id") REFERENCES "auth"."users"("id")
    ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ratings_request_rater_key" ON "rental"."ratings" USING btree ("borrow_request_id", "rater_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ratings_ratee_id_idx" ON "rental"."ratings" USING btree ("ratee_id");
--> statement-breakpoint

-- Status check constraints (ignore if already present)
DO $$ BEGIN
  ALTER TABLE "catalog"."items"
    ADD CONSTRAINT "items_status_check"
    CHECK ("status" IN ('Available', 'Borrowed', 'Unavailable'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "rental"."borrow_requests"
    ADD CONSTRAINT "borrow_requests_status_check"
    CHECK ("status" IN (
      'pending', 'approved', 'agreement_pending', 'rejected',
      'borrowed', 'returned', 'rated', 'cancelled'
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "rental"."ratings"
    ADD CONSTRAINT "ratings_score_check"
    CHECK ("score" >= 1 AND "score" <= 5);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
