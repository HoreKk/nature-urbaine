import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "reports" RENAME COLUMN "project_details_wordpress_post_id" TO "wordpress_post_id";
  ALTER TABLE "_reports_v" RENAME COLUMN "version_project_details_wordpress_post_id" TO "version_wordpress_post_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "reports" RENAME COLUMN "wordpress_post_id" TO "project_details_wordpress_post_id";
  ALTER TABLE "_reports_v" RENAME COLUMN "version_wordpress_post_id" TO "version_project_details_wordpress_post_id";`)
}
