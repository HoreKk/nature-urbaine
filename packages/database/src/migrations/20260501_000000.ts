import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_submissions_status" AS ENUM('pending', 'accepted', 'rejected');
  CREATE TABLE "submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"category_id" integer,
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
  ALTER TABLE "submissions" ADD CONSTRAINT "submissions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "submissions" ADD CONSTRAINT "submissions_promoted_report_id_reports_id_fk" FOREIGN KEY ("promoted_report_id") REFERENCES "public"."reports"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "submissions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_submissions_fk" FOREIGN KEY ("submissions_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "submissions_category_idx" ON "submissions" USING btree ("category_id");
  CREATE INDEX "submissions_promoted_report_idx" ON "submissions" USING btree ("promoted_report_id");
  CREATE INDEX "submissions_status_idx" ON "submissions" USING btree ("status");
  CREATE INDEX "submissions_updated_at_idx" ON "submissions" USING btree ("updated_at");
  CREATE INDEX "submissions_created_at_idx" ON "submissions" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("submissions_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_submissions_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "submissions_id";
  DROP TABLE "submissions" CASCADE;
  DROP TYPE "public"."enum_submissions_status";`)
}
