ALTER TABLE "catalog"."items" ADD COLUMN IF NOT EXISTS "title" varchar(255);--> statement-breakpoint
ALTER TABLE "catalog"."items" ADD COLUMN IF NOT EXISTS "description" text;--> statement-breakpoint
ALTER TABLE "catalog"."items" ADD COLUMN IF NOT EXISTS "lender_details" jsonb;--> statement-breakpoint
ALTER TABLE "catalog"."items" ALTER COLUMN "status" SET NOT NULL;
