ALTER TABLE "auth"."user_sizes" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();
--> statement-breakpoint
ALTER TABLE "rental"."borrow_requests" ADD COLUMN IF NOT EXISTS "ratings_pending" boolean DEFAULT false;
--> statement-breakpoint
ALTER TABLE "rental"."borrow_requests" ADD COLUMN IF NOT EXISTS "lender_rated" boolean DEFAULT false;
--> statement-breakpoint
ALTER TABLE "rental"."borrow_requests" ADD COLUMN IF NOT EXISTS "borrower_rated" boolean DEFAULT false;
--> statement-breakpoint
ALTER TABLE "rental"."conversations" ADD COLUMN IF NOT EXISTS "last_message" text;
--> statement-breakpoint
ALTER TABLE "rental"."conversations" ADD COLUMN IF NOT EXISTS "is_read" boolean DEFAULT true;
--> statement-breakpoint
ALTER TABLE "rental"."conversations" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();
