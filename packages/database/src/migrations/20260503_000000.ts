import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
	await db.execute(sql`
ALTER TABLE "submissions" ADD COLUMN "_order" integer;
ALTER TABLE "submissions" ADD COLUMN "pictures" integer;
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_pictures_media_id_fk" FOREIGN KEY ("pictures") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
CREATE INDEX "submissions_order_idx" ON "submissions" USING btree ("_order");
CREATE INDEX "submissions_pictures_idx" ON "submissions" USING btree ("pictures");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
	await db.execute(sql`
DROP INDEX "submissions_order_idx";
DROP INDEX "submissions_pictures_idx";
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_pictures_media_id_fk";
ALTER TABLE "submissions" DROP COLUMN "_order";
ALTER TABLE "submissions" DROP COLUMN "pictures";`);
}
