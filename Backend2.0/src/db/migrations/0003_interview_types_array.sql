-- Convert interview_type from varchar(100) to text[]
ALTER TABLE "catalog"."items" 
  ALTER COLUMN "interview_type" TYPE text[] 
  USING ARRAY["interview_type"];
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "items_interview_type_idx" ON "catalog"."items" USING gin ("interview_type");
