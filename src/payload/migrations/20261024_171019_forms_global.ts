import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "forms_contact_sector_groups_sectors" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "forms_contact_sector_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "forms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "forms_contact_sector_groups_sectors" ADD CONSTRAINT "forms_contact_sector_groups_sectors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_contact_sector_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_contact_sector_groups" ADD CONSTRAINT "forms_contact_sector_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "forms_contact_sector_groups_sectors_order_idx" ON "forms_contact_sector_groups_sectors" USING btree ("_order");
  CREATE INDEX "forms_contact_sector_groups_sectors_parent_id_idx" ON "forms_contact_sector_groups_sectors" USING btree ("_parent_id");
  CREATE INDEX "forms_contact_sector_groups_order_idx" ON "forms_contact_sector_groups" USING btree ("_order");
  CREATE INDEX "forms_contact_sector_groups_parent_id_idx" ON "forms_contact_sector_groups" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "forms_contact_sector_groups_sectors" CASCADE;
  DROP TABLE "forms_contact_sector_groups" CASCADE;
  DROP TABLE "forms" CASCADE;`)
}
