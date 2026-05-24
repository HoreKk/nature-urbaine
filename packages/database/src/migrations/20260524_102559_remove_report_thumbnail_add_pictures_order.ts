import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_reports_location_details_city_stratum" AS ENUM('moins-de-500', '500-a-2000', '2000-a-3500', '3500-a-10000', '10000-a-30000', '30000-a-100000', 'plus-de-100000');
  CREATE TYPE "public"."enum__reports_v_version_location_details_city_stratum" AS ENUM('moins-de-500', '500-a-2000', '2000-a-3500', '3500-a-10000', '10000-a-30000', '30000-a-100000', 'plus-de-100000');
  ALTER TABLE "reports" DROP CONSTRAINT "reports_thumbnail_id_media_id_fk";
  
  ALTER TABLE "_reports_v" DROP CONSTRAINT "_reports_v_version_thumbnail_id_media_id_fk";
  
  DROP INDEX "reports_thumbnail_idx";
  DROP INDEX "_reports_v_version_version_thumbnail_idx";
  ALTER TABLE "reports" ALTER COLUMN "location_details_city_stratum" SET DATA TYPE "public"."enum_reports_location_details_city_stratum" USING "location_details_city_stratum"::"public"."enum_reports_location_details_city_stratum";
  ALTER TABLE "_reports_v" ALTER COLUMN "version_location_details_city_stratum" SET DATA TYPE "public"."enum__reports_v_version_location_details_city_stratum" USING "version_location_details_city_stratum"::"public"."enum__reports_v_version_location_details_city_stratum";
  ALTER TABLE "pictures" ADD COLUMN "_pictures_relatedpictures_order" varchar;
  CREATE INDEX "pictures__pictures_relatedpictures_order_idx" ON "pictures" USING btree ("_pictures_relatedpictures_order");
  ALTER TABLE "reports" DROP COLUMN "thumbnail_id";
  ALTER TABLE "_reports_v" DROP COLUMN "version_thumbnail_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "pictures__pictures_relatedpictures_order_idx";
  ALTER TABLE "reports" ALTER COLUMN "location_details_city_stratum" SET DATA TYPE varchar;
  ALTER TABLE "_reports_v" ALTER COLUMN "version_location_details_city_stratum" SET DATA TYPE varchar;
  ALTER TABLE "reports" ADD COLUMN "thumbnail_id" integer;
  ALTER TABLE "_reports_v" ADD COLUMN "version_thumbnail_id" integer;
  ALTER TABLE "reports" ADD CONSTRAINT "reports_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_reports_v" ADD CONSTRAINT "_reports_v_version_thumbnail_id_media_id_fk" FOREIGN KEY ("version_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "reports_thumbnail_idx" ON "reports" USING btree ("thumbnail_id");
  CREATE INDEX "_reports_v_version_version_thumbnail_idx" ON "_reports_v" USING btree ("version_thumbnail_id");
  ALTER TABLE "pictures" DROP COLUMN "_pictures_relatedpictures_order";
  DROP TYPE "public"."enum_reports_location_details_city_stratum";
  DROP TYPE "public"."enum__reports_v_version_location_details_city_stratum";`)
}
