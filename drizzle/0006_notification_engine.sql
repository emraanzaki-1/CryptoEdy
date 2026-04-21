-- Sprint 10: Notification Engine
-- Creates notifications table, redesigns notification_preferences from flat booleans to per-subtype rows.

-- 1. Create enums
DO $$ BEGIN
  CREATE TYPE "public"."notification_type" AS ENUM('content', 'community', 'feed', 'account');
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."notification_subtype" AS ENUM('research', 'analysis', 'message', 'mention', 'reply', 'market_direction', 'picks', 'advertising', 'subscription', 'referral');
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- 2. Create notifications table
CREATE TABLE "notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "type" "notification_type" NOT NULL,
  "subtype" "notification_subtype" NOT NULL,
  "title" varchar(255) NOT NULL,
  "body" text NOT NULL,
  "link" text,
  "is_read" boolean DEFAULT false NOT NULL,
  "actor_id" uuid,
  "actor_avatar" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- 3. Add foreign keys for notifications
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

-- 4. Create indexes for notifications
CREATE INDEX "notifications_user_read_idx" ON "notifications" USING btree ("user_id", "is_read");
--> statement-breakpoint
CREATE INDEX "notifications_user_created_idx" ON "notifications" USING btree ("user_id", "created_at");
--> statement-breakpoint
CREATE INDEX "notifications_user_type_read_idx" ON "notifications" USING btree ("user_id", "type", "is_read");
--> statement-breakpoint

-- 5. Drop old notification_preferences table
DROP TABLE IF EXISTS "notification_preferences";
--> statement-breakpoint

-- 6. Create new notification_preferences table (per-subtype rows)
CREATE TABLE "notification_preferences" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "type" "notification_type" NOT NULL,
  "subtype" "notification_subtype" NOT NULL,
  "in_app" boolean DEFAULT true NOT NULL,
  "email" boolean DEFAULT true NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "notification_preferences_user_type_subtype_idx" ON "notification_preferences" USING btree ("user_id", "type", "subtype");
--> statement-breakpoint

-- 7. Seed default preferences for all existing users (9 rows per user)
INSERT INTO "notification_preferences" ("user_id", "type", "subtype")
SELECT u.id, t.type::notification_type, t.subtype::notification_subtype
FROM "users" u
CROSS JOIN (VALUES
  ('content', 'research'),
  ('content', 'analysis'),
  ('community', 'message'),
  ('community', 'mention'),
  ('community', 'reply'),
  ('feed', 'market_direction'),
  ('feed', 'picks'),
  ('account', 'subscription'),
  ('account', 'referral')
) AS t(type, subtype)
ON CONFLICT DO NOTHING;
