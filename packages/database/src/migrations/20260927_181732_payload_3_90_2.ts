import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ALTER COLUMN "prefix" SET DEFAULT 'media';
  ALTER TABLE "media" ADD COLUMN "_objectkey" varchar;
  ALTER TABLE "pictures" ADD COLUMN "_objectkey" varchar;
  ALTER TABLE "users" ADD COLUMN "reset_password_requested_at" timestamp(3) with time zone;
  ALTER TABLE "reports" DROP COLUMN "location_details_nb_populations";
  ALTER TABLE "_reports_v" DROP COLUMN "version_location_details_nb_populations";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ALTER COLUMN "prefix" SET DEFAULT '';
  ALTER TABLE "reports" ADD COLUMN "location_details_nb_populations" numeric;
  ALTER TABLE "_reports_v" ADD COLUMN "version_location_details_nb_populations" numeric;
  ALTER TABLE "media" DROP COLUMN "_objectkey";
  ALTER TABLE "pictures" DROP COLUMN "_objectkey";
  ALTER TABLE "users" DROP COLUMN "reset_password_requested_at";`)
}
