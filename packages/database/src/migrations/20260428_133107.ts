import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "reports" ADD COLUMN "project_name" varchar;
  ALTER TABLE "reports" ADD COLUMN "location_details_country" varchar;
  ALTER TABLE "reports" ADD COLUMN "location_details_city" varchar;
  ALTER TABLE "reports" ADD COLUMN "location_details_postal_code" varchar;
  ALTER TABLE "reports" ADD COLUMN "location_details_address" varchar;
  ALTER TABLE "reports" ADD COLUMN "location_details_location" geometry(Point);
  ALTER TABLE "reports" ADD COLUMN "location_details_department_code" varchar;
  ALTER TABLE "reports" ADD COLUMN "location_details_department" varchar;
  ALTER TABLE "reports" ADD COLUMN "location_details_region" varchar;
  ALTER TABLE "reports" ADD COLUMN "location_details_city_stratum" varchar;
  ALTER TABLE "reports" ADD COLUMN "location_details_nb_populations" numeric;
  ALTER TABLE "reports" ADD COLUMN "project_details_photo_author" varchar;
  ALTER TABLE "reports" ADD COLUMN "project_details_wordpress_post_id" numeric;
  ALTER TABLE "reports" ADD COLUMN "project_details_project_owner" varchar;
  ALTER TABLE "reports" ADD COLUMN "project_details_project_management" varchar;
  ALTER TABLE "reports" ADD COLUMN "project_details_delivery_year" numeric;
  ALTER TABLE "reports" ADD COLUMN "project_details_project_cost" varchar;
  ALTER TABLE "reports" ADD COLUMN "project_details_project_area" varchar;
  ALTER TABLE "_reports_v" ADD COLUMN "version_project_name" varchar;
  ALTER TABLE "_reports_v" ADD COLUMN "version_location_details_country" varchar;
  ALTER TABLE "_reports_v" ADD COLUMN "version_location_details_city" varchar;
  ALTER TABLE "_reports_v" ADD COLUMN "version_location_details_postal_code" varchar;
  ALTER TABLE "_reports_v" ADD COLUMN "version_location_details_address" varchar;
  ALTER TABLE "_reports_v" ADD COLUMN "version_location_details_location" geometry(Point);
  ALTER TABLE "_reports_v" ADD COLUMN "version_location_details_department_code" varchar;
  ALTER TABLE "_reports_v" ADD COLUMN "version_location_details_department" varchar;
  ALTER TABLE "_reports_v" ADD COLUMN "version_location_details_region" varchar;
  ALTER TABLE "_reports_v" ADD COLUMN "version_location_details_city_stratum" varchar;
  ALTER TABLE "_reports_v" ADD COLUMN "version_location_details_nb_populations" numeric;
  ALTER TABLE "_reports_v" ADD COLUMN "version_project_details_photo_author" varchar;
  ALTER TABLE "_reports_v" ADD COLUMN "version_project_details_wordpress_post_id" numeric;
  ALTER TABLE "_reports_v" ADD COLUMN "version_project_details_project_owner" varchar;
  ALTER TABLE "_reports_v" ADD COLUMN "version_project_details_project_management" varchar;
  ALTER TABLE "_reports_v" ADD COLUMN "version_project_details_delivery_year" numeric;
  ALTER TABLE "_reports_v" ADD COLUMN "version_project_details_project_cost" varchar;
  ALTER TABLE "_reports_v" ADD COLUMN "version_project_details_project_area" varchar;
  ALTER TABLE "reports" DROP COLUMN "location";
  ALTER TABLE "reports" DROP COLUMN "city_stratum";
  ALTER TABLE "reports" DROP COLUMN "nb_populations";
  ALTER TABLE "_reports_v" DROP COLUMN "version_location";
  ALTER TABLE "_reports_v" DROP COLUMN "version_city_stratum";
  ALTER TABLE "_reports_v" DROP COLUMN "version_nb_populations";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "reports" ADD COLUMN "location" geometry(Point);
  ALTER TABLE "reports" ADD COLUMN "city_stratum" varchar;
  ALTER TABLE "reports" ADD COLUMN "nb_populations" numeric;
  ALTER TABLE "_reports_v" ADD COLUMN "version_location" geometry(Point);
  ALTER TABLE "_reports_v" ADD COLUMN "version_city_stratum" varchar;
  ALTER TABLE "_reports_v" ADD COLUMN "version_nb_populations" numeric;
  ALTER TABLE "reports" DROP COLUMN "project_name";
  ALTER TABLE "reports" DROP COLUMN "location_details_country";
  ALTER TABLE "reports" DROP COLUMN "location_details_city";
  ALTER TABLE "reports" DROP COLUMN "location_details_postal_code";
  ALTER TABLE "reports" DROP COLUMN "location_details_address";
  ALTER TABLE "reports" DROP COLUMN "location_details_location";
  ALTER TABLE "reports" DROP COLUMN "location_details_department_code";
  ALTER TABLE "reports" DROP COLUMN "location_details_department";
  ALTER TABLE "reports" DROP COLUMN "location_details_region";
  ALTER TABLE "reports" DROP COLUMN "location_details_city_stratum";
  ALTER TABLE "reports" DROP COLUMN "location_details_nb_populations";
  ALTER TABLE "reports" DROP COLUMN "project_details_photo_author";
  ALTER TABLE "reports" DROP COLUMN "project_details_wordpress_post_id";
  ALTER TABLE "reports" DROP COLUMN "project_details_project_owner";
  ALTER TABLE "reports" DROP COLUMN "project_details_project_management";
  ALTER TABLE "reports" DROP COLUMN "project_details_delivery_year";
  ALTER TABLE "reports" DROP COLUMN "project_details_project_cost";
  ALTER TABLE "reports" DROP COLUMN "project_details_project_area";
  ALTER TABLE "_reports_v" DROP COLUMN "version_project_name";
  ALTER TABLE "_reports_v" DROP COLUMN "version_location_details_country";
  ALTER TABLE "_reports_v" DROP COLUMN "version_location_details_city";
  ALTER TABLE "_reports_v" DROP COLUMN "version_location_details_postal_code";
  ALTER TABLE "_reports_v" DROP COLUMN "version_location_details_address";
  ALTER TABLE "_reports_v" DROP COLUMN "version_location_details_location";
  ALTER TABLE "_reports_v" DROP COLUMN "version_location_details_department_code";
  ALTER TABLE "_reports_v" DROP COLUMN "version_location_details_department";
  ALTER TABLE "_reports_v" DROP COLUMN "version_location_details_region";
  ALTER TABLE "_reports_v" DROP COLUMN "version_location_details_city_stratum";
  ALTER TABLE "_reports_v" DROP COLUMN "version_location_details_nb_populations";
  ALTER TABLE "_reports_v" DROP COLUMN "version_project_details_photo_author";
  ALTER TABLE "_reports_v" DROP COLUMN "version_project_details_wordpress_post_id";
  ALTER TABLE "_reports_v" DROP COLUMN "version_project_details_project_owner";
  ALTER TABLE "_reports_v" DROP COLUMN "version_project_details_project_management";
  ALTER TABLE "_reports_v" DROP COLUMN "version_project_details_delivery_year";
  ALTER TABLE "_reports_v" DROP COLUMN "version_project_details_project_cost";
  ALTER TABLE "_reports_v" DROP COLUMN "version_project_details_project_area";`)
}
