import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "reports" DROP COLUMN "location_details_location";
  ALTER TABLE "_reports_v" DROP COLUMN "version_location_details_location";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "reports" ADD COLUMN "location_details_location" geometry(Point);
  ALTER TABLE "_reports_v" ADD COLUMN "version_location_details_location" geometry(Point);`)
}
