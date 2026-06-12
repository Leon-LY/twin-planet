CREATE TABLE IF NOT EXISTS "babies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"twin_group_id" uuid,
	"name" varchar(32) NOT NULL,
	"nickname" varchar(32),
	"gender" varchar(8) NOT NULL,
	"birth_date" varchar(10) NOT NULL,
	"birth_order" integer NOT NULL,
	"color" varchar(7) NOT NULL,
	"avatar" text,
	"birth_weight" real,
	"birth_height" real,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "parent_contributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"user_name" varchar(32) NOT NULL,
	"category" varchar(16) NOT NULL,
	"note" text,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"baby_id" uuid NOT NULL,
	"type" varchar(16) NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone NOT NULL,
	"duration_min" integer DEFAULT 0 NOT NULL,
	"detail" text,
	"feeding_side" varchar(8),
	"amount_ml" integer,
	"sleep_quality" integer,
	"diaper_type" varchar(8),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sibling_interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"twin_group_id" uuid NOT NULL,
	"baby_ids" jsonb NOT NULL,
	"type" varchar(16) NOT NULL,
	"note" text,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "twin_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"openid" varchar(128) NOT NULL,
	"nickname" varchar(64),
	"avatar" text,
	"phone" text,
	"role" varchar(16) DEFAULT 'mom' NOT NULL,
	"preferred_ui_mode" varchar(16) DEFAULT 'normal' NOT NULL,
	"ui_config" jsonb DEFAULT '{"fontSize":14,"showTTS":false,"simplifiedHome":false,"autoNightMode":true}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "babies" ADD CONSTRAINT "babies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "babies" ADD CONSTRAINT "babies_twin_group_id_twin_groups_id_fk" FOREIGN KEY ("twin_group_id") REFERENCES "public"."twin_groups"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "parent_contributions" ADD CONSTRAINT "parent_contributions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "records" ADD CONSTRAINT "records_baby_id_babies_id_fk" FOREIGN KEY ("baby_id") REFERENCES "public"."babies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sibling_interactions" ADD CONSTRAINT "sibling_interactions_twin_group_id_twin_groups_id_fk" FOREIGN KEY ("twin_group_id") REFERENCES "public"."twin_groups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "twin_groups" ADD CONSTRAINT "twin_groups_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_openid_idx" ON "users" USING btree ("openid");