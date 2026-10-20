import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "interviews" ADD COLUMN "thumbnail_id" integer;
  ALTER TABLE "interviews" ADD COLUMN "interviewee_picture_id" integer;
  ALTER TABLE "interviews" ADD COLUMN "project_cost" varchar;
  ALTER TABLE "interviews" ADD CONSTRAINT "interviews_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "interviews" ADD CONSTRAINT "interviews_interviewee_picture_id_media_id_fk" FOREIGN KEY ("interviewee_picture_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "interviews_thumbnail_idx" ON "interviews" USING btree ("thumbnail_id");
  CREATE INDEX "interviews_interviewee_picture_idx" ON "interviews" USING btree ("interviewee_picture_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "interviews" DROP CONSTRAINT "interviews_thumbnail_id_media_id_fk";
  
  ALTER TABLE "interviews" DROP CONSTRAINT "interviews_interviewee_picture_id_media_id_fk";
  
  DROP INDEX "interviews_thumbnail_idx";
  DROP INDEX "interviews_interviewee_picture_idx";
  ALTER TABLE "interviews" DROP COLUMN "thumbnail_id";
  ALTER TABLE "interviews" DROP COLUMN "interviewee_picture_id";
  ALTER TABLE "interviews" DROP COLUMN "project_cost";`)
}
