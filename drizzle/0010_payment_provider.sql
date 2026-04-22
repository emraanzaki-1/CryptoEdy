-- Migration: Add provider columns to payments table for multi-provider support
ALTER TABLE "payments" ADD COLUMN "provider" varchar(50) NOT NULL DEFAULT 'thirdweb';
ALTER TABLE "payments" ADD COLUMN "provider_payment_id" varchar(255);
CREATE UNIQUE INDEX "payments_provider_payment_id_idx" ON "payments" ("provider", "provider_payment_id");
