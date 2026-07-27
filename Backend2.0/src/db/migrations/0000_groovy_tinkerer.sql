CREATE SCHEMA "auth";
--> statement-breakpoint
CREATE SCHEMA "catalog";
--> statement-breakpoint
CREATE SCHEMA "rental";
--> statement-breakpoint
CREATE TABLE "auth"."user_sizes" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"height" varchar(50),
	"fit_type" varchar(50),
	"top_size" varchar(50),
	"bottom_size" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255),
	"role" varchar(50) DEFAULT 'user',
	"linkedin_id" varchar(255),
	"profile_photo" text,
	"bio" text,
	"active_role" varchar(50) DEFAULT 'borrower',
	"is_profile_complete" boolean DEFAULT false,
	"is_restricted" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_linkedin_id_unique" UNIQUE("linkedin_id")
);
--> statement-breakpoint
CREATE TABLE "catalog"."items" (
	"id" serial PRIMARY KEY NOT NULL,
	"lender_id" integer NOT NULL,
	"category" varchar(100) NOT NULL,
	"size_label" varchar(50) NOT NULL,
	"interview_type" varchar(100) NOT NULL,
	"fabric_type" varchar(100),
	"confidence_note" text,
	"status" varchar(50) DEFAULT 'Available',
	"images" text[] NOT NULL,
	"measurements" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "catalog"."saved_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"borrower_id" integer NOT NULL,
	"item_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rental"."borrow_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"borrower_id" integer NOT NULL,
	"lender_id" integer NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"agreement_accepted_at" timestamp with time zone,
	"borrowed_at" timestamp with time zone,
	"returned_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rental"."conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"borrow_request_id" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "conversations_borrow_request_id_unique" UNIQUE("borrow_request_id")
);
--> statement-breakpoint
CREATE TABLE "rental"."messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"message_text" text NOT NULL,
	"is_system_message" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "auth"."user_sizes" ADD CONSTRAINT "user_sizes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."items" ADD CONSTRAINT "items_lender_id_users_id_fk" FOREIGN KEY ("lender_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."saved_items" ADD CONSTRAINT "saved_items_borrower_id_users_id_fk" FOREIGN KEY ("borrower_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."saved_items" ADD CONSTRAINT "saved_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "catalog"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rental"."borrow_requests" ADD CONSTRAINT "borrow_requests_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "catalog"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rental"."borrow_requests" ADD CONSTRAINT "borrow_requests_borrower_id_users_id_fk" FOREIGN KEY ("borrower_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rental"."borrow_requests" ADD CONSTRAINT "borrow_requests_lender_id_users_id_fk" FOREIGN KEY ("lender_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rental"."conversations" ADD CONSTRAINT "conversations_borrow_request_id_borrow_requests_id_fk" FOREIGN KEY ("borrow_request_id") REFERENCES "rental"."borrow_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rental"."messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "rental"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rental"."messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "saved_items_borrower_item_key" ON "catalog"."saved_items" USING btree ("borrower_id","item_id");