import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "interviews" DROP CONSTRAINT "interviews_thumbnail_id_media_id_fk";
  
  DROP INDEX "interviews_thumbnail_idx";
  ALTER TABLE "interviews" DROP COLUMN "thumbnail_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "interviews" ADD COLUMN "thumbnail_id" integer;
  ALTER TABLE "interviews" ADD CONSTRAINT "interviews_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "interviews_thumbnail_idx" ON "interviews" USING btree ("thumbnail_id");`)
}
