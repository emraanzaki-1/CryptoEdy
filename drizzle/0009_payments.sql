-- Sprint 6: Payments table for subscription billing
-- Manual migration — drizzle-kit generate has schema drift from 0006/0007/0008 manual migrations

CREATE TYPE "public"."payment_status" AS ENUM('confirmed', 'pending', 'failed');

CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tx_hash" varchar(255) NOT NULL,
	"chain" varchar(50) NOT NULL,
	"asset" varchar(10) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" "payment_status" NOT NULL,
	"wallet_address" varchar(255),
	"recipient_address" varchar(255),
	"status_reason" text,
	"admin_note" text,
	"confirmed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_tx_hash_unique" UNIQUE("tx_hash")
);

ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
  ON DELETE cascade ON UPDATE no action;

CREATE INDEX "payments_user_id_idx" ON "payments" USING btree ("user_id");
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");
CREATE INDEX "payments_chain_idx" ON "payments" USING btree ("chain");
CREATE INDEX "payments_created_at_idx" ON "payments" USING btree ("created_at");
