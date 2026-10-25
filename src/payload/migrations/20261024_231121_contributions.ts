import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_contributions_location_details_city_stratum" AS ENUM('moins-de-500', '500-a-2000', '2000-a-3500', '3500-a-10000', '10000-a-30000', '30000-a-100000', 'plus-de-100000');
  CREATE TYPE "public"."enum_contributions_status" AS ENUM('pending', 'accepted', 'published', 'rejected');
  CREATE TABLE "contributions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"category_id" integer NOT NULL,
  	"project_details_project_owner" varchar,
  	"project_details_project_management" varchar,
  	"project_details_delivery_year" numeric,
  	"project_details_project_cost" varchar,
  	"project_details_project_area" varchar,
  	"location_details_country" varchar,
  	"location_details_city" varchar,
  	"location_details_postal_code" varchar,
  	"location_details_address" varchar,
  	"location_details_department_code" varchar,
  	"location_details_department" varchar,
  	"location_details_region" varchar,
  	"location_details_city_stratum" "enum_contributions_location_details_city_stratum",
  	"photos_taken_at" timestamp(3) with time zone,
  	"author_name" varchar NOT NULL,
  	"author_email" varchar NOT NULL,
  	"archive_id" integer,
  	"status" "enum_contributions_status" DEFAULT 'pending' NOT NULL,
  	"rejection_note" varchar,
  	"report_id" integer,
  	"consented_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contribution_archives" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"prefix" varchar DEFAULT 'contribution-archives',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"original_filename" varchar,
  	"original_url" varchar,
  	"original_mime_type" varchar,
  	"original_filesize" numeric,
  	"original_width" numeric,
  	"original_height" numeric,
  	"original_prefix" varchar,
  	"original__objectkey" varchar,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_submissions_fk";
  ALTER TABLE "submissions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "submissions_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "submissions" CASCADE;
  DROP TABLE "submissions_rels" CASCADE;
  
  DROP INDEX "payload_locked_documents_rels_submissions_id_idx";
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "contributions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "contribution_archives_id" integer;
  ALTER TABLE "contributions" ADD CONSTRAINT "contributions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contributions" ADD CONSTRAINT "contributions_archive_id_contribution_archives_id_fk" FOREIGN KEY ("archive_id") REFERENCES "public"."contribution_archives"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contributions" ADD CONSTRAINT "contributions_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "contributions_category_idx" ON "contributions" USING btree ("category_id");
  CREATE INDEX "contributions_archive_idx" ON "contributions" USING btree ("archive_id");
  CREATE INDEX "contributions_report_idx" ON "contributions" USING btree ("report_id");
  CREATE INDEX "contributions_updated_at_idx" ON "contributions" USING btree ("updated_at");
  CREATE INDEX "contributions_created_at_idx" ON "contributions" USING btree ("created_at");
  CREATE INDEX "contribution_archives_updated_at_idx" ON "contribution_archives" USING btree ("updated_at");
  CREATE INDEX "contribution_archives_created_at_idx" ON "contribution_archives" USING btree ("created_at");
  CREATE UNIQUE INDEX "contribution_archives_filename_idx" ON "contribution_archives" USING btree ("filename");
  CREATE INDEX "contribution_archives_original_original_filename_idx" ON "contribution_archives" USING btree ("original_filename");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contributions_fk" FOREIGN KEY ("contributions_id") REFERENCES "public"."contributions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contribution_archives_fk" FOREIGN KEY ("contribution_archives_id") REFERENCES "public"."contribution_archives"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_contributions_id_idx" ON "payload_locked_documents_rels" USING btree ("contributions_id");
  CREATE INDEX "payload_locked_documents_rels_contribution_archives_id_idx" ON "payload_locked_documents_rels" USING btree ("contribution_archives_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "submissions_id";
  DROP TYPE "public"."enum_submissions_status";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
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
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_contributions_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_contribution_archives_fk";
  ALTER TABLE "contributions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contribution_archives" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "contributions" CASCADE;
  DROP TABLE "contribution_archives" CASCADE;
  
  
  DROP INDEX "payload_locked_documents_rels_contributions_id_idx";
  DROP INDEX "payload_locked_documents_rels_contribution_archives_id_idx";
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
  CREATE INDEX "payload_locked_documents_rels_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("submissions_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "contributions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "contribution_archives_id";
  DROP TYPE "public"."enum_contributions_location_details_city_stratum";
  DROP TYPE "public"."enum_contributions_status";`)
}
