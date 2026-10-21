import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "interview_pictures" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_interview_pictures_relatedpictures_order" varchar,
  	"alt" varchar NOT NULL,
  	"interview_id" integer NOT NULL,
  	"prefix" varchar DEFAULT 'interview-pictures',
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
  	"focal_y" numeric,
  	"variants_thumbnail_url" varchar,
  	"variants_thumbnail_width" numeric,
  	"variants_thumbnail_height" numeric,
  	"variants_thumbnail_mime_type" varchar,
  	"variants_thumbnail_filesize" numeric,
  	"variants_thumbnail_filename" varchar,
  	"variants_thumbnail_prefix" varchar,
  	"variants_thumbnail__objectkey" varchar,
  	"variants_medium_url" varchar,
  	"variants_medium_width" numeric,
  	"variants_medium_height" numeric,
  	"variants_medium_mime_type" varchar,
  	"variants_medium_filesize" numeric,
  	"variants_medium_filename" varchar,
  	"variants_medium_prefix" varchar,
  	"variants_medium__objectkey" varchar,
  	"variants_large_url" varchar,
  	"variants_large_width" numeric,
  	"variants_large_height" numeric,
  	"variants_large_mime_type" varchar,
  	"variants_large_filesize" numeric,
  	"variants_large_filename" varchar,
  	"variants_large_prefix" varchar,
  	"variants_large__objectkey" varchar
  );
  
  ALTER TABLE "media" ADD COLUMN "variants_thumbnail_url" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_thumbnail_width" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_thumbnail_height" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_thumbnail_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_thumbnail_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_thumbnail_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_thumbnail_prefix" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_thumbnail__objectkey" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_medium_url" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_medium_width" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_medium_height" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_medium_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_medium_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_medium_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_medium_prefix" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_medium__objectkey" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_large_url" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_large_width" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_large_height" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_large_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_large_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_large_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_large_prefix" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_large__objectkey" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "interview_pictures_id" integer;
  ALTER TABLE "interview_pictures" ADD CONSTRAINT "interview_pictures_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "interview_pictures__interview_pictures_relatedpictures_o_idx" ON "interview_pictures" USING btree ("_interview_pictures_relatedpictures_order");
  CREATE INDEX "interview_pictures_interview_idx" ON "interview_pictures" USING btree ("interview_id");
  CREATE INDEX "interview_pictures_updated_at_idx" ON "interview_pictures" USING btree ("updated_at");
  CREATE INDEX "interview_pictures_created_at_idx" ON "interview_pictures" USING btree ("created_at");
  CREATE UNIQUE INDEX "interview_pictures_filename_idx" ON "interview_pictures" USING btree ("filename");
  CREATE INDEX "interview_pictures_original_original_filename_idx" ON "interview_pictures" USING btree ("original_filename");
  CREATE INDEX "interview_pictures_variants_thumbnail_variants_thumbnail_idx" ON "interview_pictures" USING btree ("variants_thumbnail_filename");
  CREATE INDEX "interview_pictures_variants_medium_variants_medium_filen_idx" ON "interview_pictures" USING btree ("variants_medium_filename");
  CREATE INDEX "interview_pictures_variants_large_variants_large_filenam_idx" ON "interview_pictures" USING btree ("variants_large_filename");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_interview_pictures_fk" FOREIGN KEY ("interview_pictures_id") REFERENCES "public"."interview_pictures"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_variants_thumbnail_variants_thumbnail_filename_idx" ON "media" USING btree ("variants_thumbnail_filename");
  CREATE INDEX "media_variants_medium_variants_medium_filename_idx" ON "media" USING btree ("variants_medium_filename");
  CREATE INDEX "media_variants_large_variants_large_filename_idx" ON "media" USING btree ("variants_large_filename");
  CREATE INDEX "payload_locked_documents_rels_interview_pictures_id_idx" ON "payload_locked_documents_rels" USING btree ("interview_pictures_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_interview_pictures_fk";
  ALTER TABLE "interview_pictures" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "interview_pictures" CASCADE;
  
  DROP INDEX "media_variants_thumbnail_variants_thumbnail_filename_idx";
  DROP INDEX "media_variants_medium_variants_medium_filename_idx";
  DROP INDEX "media_variants_large_variants_large_filename_idx";
  DROP INDEX "payload_locked_documents_rels_interview_pictures_id_idx";
  ALTER TABLE "media" DROP COLUMN "variants_thumbnail_url";
  ALTER TABLE "media" DROP COLUMN "variants_thumbnail_width";
  ALTER TABLE "media" DROP COLUMN "variants_thumbnail_height";
  ALTER TABLE "media" DROP COLUMN "variants_thumbnail_mime_type";
  ALTER TABLE "media" DROP COLUMN "variants_thumbnail_filesize";
  ALTER TABLE "media" DROP COLUMN "variants_thumbnail_filename";
  ALTER TABLE "media" DROP COLUMN "variants_thumbnail_prefix";
  ALTER TABLE "media" DROP COLUMN "variants_thumbnail__objectkey";
  ALTER TABLE "media" DROP COLUMN "variants_medium_url";
  ALTER TABLE "media" DROP COLUMN "variants_medium_width";
  ALTER TABLE "media" DROP COLUMN "variants_medium_height";
  ALTER TABLE "media" DROP COLUMN "variants_medium_mime_type";
  ALTER TABLE "media" DROP COLUMN "variants_medium_filesize";
  ALTER TABLE "media" DROP COLUMN "variants_medium_filename";
  ALTER TABLE "media" DROP COLUMN "variants_medium_prefix";
  ALTER TABLE "media" DROP COLUMN "variants_medium__objectkey";
  ALTER TABLE "media" DROP COLUMN "variants_large_url";
  ALTER TABLE "media" DROP COLUMN "variants_large_width";
  ALTER TABLE "media" DROP COLUMN "variants_large_height";
  ALTER TABLE "media" DROP COLUMN "variants_large_mime_type";
  ALTER TABLE "media" DROP COLUMN "variants_large_filesize";
  ALTER TABLE "media" DROP COLUMN "variants_large_filename";
  ALTER TABLE "media" DROP COLUMN "variants_large_prefix";
  ALTER TABLE "media" DROP COLUMN "variants_large__objectkey";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "interview_pictures_id";`)
}
