import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pictures" ADD COLUMN "variants_medium_url" varchar;
  ALTER TABLE "pictures" ADD COLUMN "variants_medium_width" numeric;
  ALTER TABLE "pictures" ADD COLUMN "variants_medium_height" numeric;
  ALTER TABLE "pictures" ADD COLUMN "variants_medium_mime_type" varchar;
  ALTER TABLE "pictures" ADD COLUMN "variants_medium_filesize" numeric;
  ALTER TABLE "pictures" ADD COLUMN "variants_medium_filename" varchar;
  ALTER TABLE "pictures" ADD COLUMN "variants_medium_prefix" varchar;
  ALTER TABLE "pictures" ADD COLUMN "variants_medium__objectkey" varchar;
  ALTER TABLE "pictures" ADD COLUMN "variants_large_url" varchar;
  ALTER TABLE "pictures" ADD COLUMN "variants_large_width" numeric;
  ALTER TABLE "pictures" ADD COLUMN "variants_large_height" numeric;
  ALTER TABLE "pictures" ADD COLUMN "variants_large_mime_type" varchar;
  ALTER TABLE "pictures" ADD COLUMN "variants_large_filesize" numeric;
  ALTER TABLE "pictures" ADD COLUMN "variants_large_filename" varchar;
  ALTER TABLE "pictures" ADD COLUMN "variants_large_prefix" varchar;
  ALTER TABLE "pictures" ADD COLUMN "variants_large__objectkey" varchar;
  CREATE INDEX "pictures_variants_medium_variants_medium_filename_idx" ON "pictures" USING btree ("variants_medium_filename");
  CREATE INDEX "pictures_variants_large_variants_large_filename_idx" ON "pictures" USING btree ("variants_large_filename");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "pictures_variants_medium_variants_medium_filename_idx";
  DROP INDEX "pictures_variants_large_variants_large_filename_idx";
  ALTER TABLE "pictures" DROP COLUMN "variants_medium_url";
  ALTER TABLE "pictures" DROP COLUMN "variants_medium_width";
  ALTER TABLE "pictures" DROP COLUMN "variants_medium_height";
  ALTER TABLE "pictures" DROP COLUMN "variants_medium_mime_type";
  ALTER TABLE "pictures" DROP COLUMN "variants_medium_filesize";
  ALTER TABLE "pictures" DROP COLUMN "variants_medium_filename";
  ALTER TABLE "pictures" DROP COLUMN "variants_medium_prefix";
  ALTER TABLE "pictures" DROP COLUMN "variants_medium__objectkey";
  ALTER TABLE "pictures" DROP COLUMN "variants_large_url";
  ALTER TABLE "pictures" DROP COLUMN "variants_large_width";
  ALTER TABLE "pictures" DROP COLUMN "variants_large_height";
  ALTER TABLE "pictures" DROP COLUMN "variants_large_mime_type";
  ALTER TABLE "pictures" DROP COLUMN "variants_large_filesize";
  ALTER TABLE "pictures" DROP COLUMN "variants_large_filename";
  ALTER TABLE "pictures" DROP COLUMN "variants_large_prefix";
  ALTER TABLE "pictures" DROP COLUMN "variants_large__objectkey";`)
}
