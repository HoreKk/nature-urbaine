import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "media_seed_key_idx";
  DROP INDEX "reports_seed_key_idx";
  DROP INDEX "_reports_v_version_version_seed_key_idx";
  DROP INDEX "interviews_seed_key_idx";
  DROP INDEX "categories_seed_key_idx";
  DROP INDEX "tags_seed_key_idx";
  DROP INDEX "tag_categories_seed_key_idx";
  ALTER TABLE "media" DROP COLUMN "seed_key";
  ALTER TABLE "reports" DROP COLUMN "seed_key";
  ALTER TABLE "_reports_v" DROP COLUMN "version_seed_key";
  ALTER TABLE "interviews" DROP COLUMN "seed_key";
  ALTER TABLE "categories" DROP COLUMN "seed_key";
  ALTER TABLE "tags" DROP COLUMN "seed_key";
  ALTER TABLE "tag_categories" DROP COLUMN "seed_key";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "seed_key" varchar;
  ALTER TABLE "reports" ADD COLUMN "seed_key" varchar;
  ALTER TABLE "_reports_v" ADD COLUMN "version_seed_key" varchar;
  ALTER TABLE "interviews" ADD COLUMN "seed_key" varchar;
  ALTER TABLE "categories" ADD COLUMN "seed_key" varchar;
  ALTER TABLE "tags" ADD COLUMN "seed_key" varchar;
  ALTER TABLE "tag_categories" ADD COLUMN "seed_key" varchar;
  CREATE UNIQUE INDEX "media_seed_key_idx" ON "media" USING btree ("seed_key");
  CREATE UNIQUE INDEX "reports_seed_key_idx" ON "reports" USING btree ("seed_key");
  CREATE INDEX "_reports_v_version_version_seed_key_idx" ON "_reports_v" USING btree ("version_seed_key");
  CREATE UNIQUE INDEX "interviews_seed_key_idx" ON "interviews" USING btree ("seed_key");
  CREATE UNIQUE INDEX "categories_seed_key_idx" ON "categories" USING btree ("seed_key");
  CREATE UNIQUE INDEX "tags_seed_key_idx" ON "tags" USING btree ("seed_key");
  CREATE UNIQUE INDEX "tag_categories_seed_key_idx" ON "tag_categories" USING btree ("seed_key");`)
}
