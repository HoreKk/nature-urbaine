import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_submissions_status" AS ENUM('pending', 'accepted', 'rejected');
  CREATE TABLE "submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"category_id" integer NOT NULL,
  	"delivery_year" numeric NOT NULL,
  	"address" varchar NOT NULL,
  	"location_details_city" varchar,
  	"location_details_postcode" varchar,
  	"location_details_department" varchar,
  	"location_details_region" varchar,
  	"location_details_citycode" varchar,
  	"contributor_email" varchar NOT NULL,
  	"status" "enum_submissions_status" DEFAULT 'pending' NOT NULL,
  	"rejection_note" varchar,
  	"promoted" boolean DEFAULT false,
  	"promoted_report_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "submissions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  ALTER TABLE "media" ADD COLUMN "seed_key" varchar;
  ALTER TABLE "reports" ADD COLUMN "seed_key" varchar;
  ALTER TABLE "_reports_v" ADD COLUMN "version_seed_key" varchar;
  ALTER TABLE "interviews" ADD COLUMN "seed_key" varchar;
  ALTER TABLE "categories" ADD COLUMN "seed_key" varchar;
  ALTER TABLE "tags" ADD COLUMN "seed_key" varchar;
  ALTER TABLE "tag_categories" ADD COLUMN "seed_key" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "submissions_id" integer;
  ALTER TABLE "submissions" ADD CONSTRAINT "submissions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "submissions" ADD CONSTRAINT "submissions_promoted_report_id_reports_id_fk" FOREIGN KEY ("promoted_report_id") REFERENCES "public"."reports"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "submissions_rels" ADD CONSTRAINT "submissions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "submissions_rels" ADD CONSTRAINT "submissions_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "submissions_category_idx" ON "submissions" USING btree ("category_id");
  CREATE INDEX "submissions_promoted_report_idx" ON "submissions" USING btree ("promoted_report_id");
  CREATE INDEX "submissions_updated_at_idx" ON "submissions" USING btree ("updated_at");
  CREATE INDEX "submissions_created_at_idx" ON "submissions" USING btree ("created_at");
  CREATE INDEX "submissions_rels_order_idx" ON "submissions_rels" USING btree ("order");
  CREATE INDEX "submissions_rels_parent_idx" ON "submissions_rels" USING btree ("parent_id");
  CREATE INDEX "submissions_rels_path_idx" ON "submissions_rels" USING btree ("path");
  CREATE INDEX "submissions_rels_media_id_idx" ON "submissions_rels" USING btree ("media_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_submissions_fk" FOREIGN KEY ("submissions_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "media_seed_key_idx" ON "media" USING btree ("seed_key");
  CREATE UNIQUE INDEX "reports_seed_key_idx" ON "reports" USING btree ("seed_key");
  CREATE INDEX "_reports_v_version_version_seed_key_idx" ON "_reports_v" USING btree ("version_seed_key");
  CREATE UNIQUE INDEX "interviews_seed_key_idx" ON "interviews" USING btree ("seed_key");
  CREATE UNIQUE INDEX "categories_seed_key_idx" ON "categories" USING btree ("seed_key");
  CREATE UNIQUE INDEX "tags_seed_key_idx" ON "tags" USING btree ("seed_key");
  CREATE UNIQUE INDEX "tag_categories_seed_key_idx" ON "tag_categories" USING btree ("seed_key");
  CREATE INDEX "payload_locked_documents_rels_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("submissions_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "submissions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "submissions_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "submissions" CASCADE;
  DROP TABLE "submissions_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_submissions_fk";
  
  DROP INDEX "media_seed_key_idx";
  DROP INDEX "reports_seed_key_idx";
  DROP INDEX "_reports_v_version_version_seed_key_idx";
  DROP INDEX "interviews_seed_key_idx";
  DROP INDEX "categories_seed_key_idx";
  DROP INDEX "tags_seed_key_idx";
  DROP INDEX "tag_categories_seed_key_idx";
  DROP INDEX "payload_locked_documents_rels_submissions_id_idx";
  ALTER TABLE "media" DROP COLUMN "seed_key";
  ALTER TABLE "reports" DROP COLUMN "seed_key";
  ALTER TABLE "_reports_v" DROP COLUMN "version_seed_key";
  ALTER TABLE "interviews" DROP COLUMN "seed_key";
  ALTER TABLE "categories" DROP COLUMN "seed_key";
  ALTER TABLE "tags" DROP COLUMN "seed_key";
  ALTER TABLE "tag_categories" DROP COLUMN "seed_key";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "submissions_id";
  DROP TYPE "public"."enum_submissions_status";`)
}
