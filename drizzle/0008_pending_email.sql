-- Sprint 12: Email change flow — stores the unverified new email while awaiting confirmation
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pending_email" varchar(255);
