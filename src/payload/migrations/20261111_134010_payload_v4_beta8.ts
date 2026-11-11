import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "contribution_archives" ADD COLUMN "_stored" boolean;
  ALTER TABLE "contribution_archives" ADD COLUMN "_transforms" jsonb;
  ALTER TABLE "contribution_archives" ADD COLUMN "original__stored" boolean;
  ALTER TABLE "pictures" ADD COLUMN "_stored" boolean;
  ALTER TABLE "pictures" ADD COLUMN "_transforms" jsonb;
  ALTER TABLE "pictures" ADD COLUMN "original__stored" boolean;
  ALTER TABLE "pictures" ADD COLUMN "variants_thumbnail__stored" boolean;
  ALTER TABLE "pictures" ADD COLUMN "variants_medium__stored" boolean;
  ALTER TABLE "pictures" ADD COLUMN "variants_large__stored" boolean;
  ALTER TABLE "interview_pictures" ADD COLUMN "_stored" boolean;
  ALTER TABLE "interview_pictures" ADD COLUMN "_transforms" jsonb;
  ALTER TABLE "interview_pictures" ADD COLUMN "original__stored" boolean;
  ALTER TABLE "interview_pictures" ADD COLUMN "variants_thumbnail__stored" boolean;
  ALTER TABLE "interview_pictures" ADD COLUMN "variants_medium__stored" boolean;
  ALTER TABLE "interview_pictures" ADD COLUMN "variants_large__stored" boolean;
  ALTER TABLE "media" ADD COLUMN "_stored" boolean;
  ALTER TABLE "media" ADD COLUMN "_transforms" jsonb;
  ALTER TABLE "media" ADD COLUMN "original__stored" boolean;
  ALTER TABLE "media" ADD COLUMN "variants_thumbnail__stored" boolean;
  ALTER TABLE "media" ADD COLUMN "variants_medium__stored" boolean;
  ALTER TABLE "media" ADD COLUMN "variants_large__stored" boolean;
  ALTER TABLE "users_sessions" ADD COLUMN "refresh_count" numeric;
  ALTER TABLE "users_sessions" ADD COLUMN "refreshed_at" timestamp(3) with time zone;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "contribution_archives" DROP COLUMN "_stored";
  ALTER TABLE "contribution_archives" DROP COLUMN "_transforms";
  ALTER TABLE "contribution_archives" DROP COLUMN "original__stored";
  ALTER TABLE "pictures" DROP COLUMN "_stored";
  ALTER TABLE "pictures" DROP COLUMN "_transforms";
  ALTER TABLE "pictures" DROP COLUMN "original__stored";
  ALTER TABLE "pictures" DROP COLUMN "variants_thumbnail__stored";
  ALTER TABLE "pictures" DROP COLUMN "variants_medium__stored";
  ALTER TABLE "pictures" DROP COLUMN "variants_large__stored";
  ALTER TABLE "interview_pictures" DROP COLUMN "_stored";
  ALTER TABLE "interview_pictures" DROP COLUMN "_transforms";
  ALTER TABLE "interview_pictures" DROP COLUMN "original__stored";
  ALTER TABLE "interview_pictures" DROP COLUMN "variants_thumbnail__stored";
  ALTER TABLE "interview_pictures" DROP COLUMN "variants_medium__stored";
  ALTER TABLE "interview_pictures" DROP COLUMN "variants_large__stored";
  ALTER TABLE "media" DROP COLUMN "_stored";
  ALTER TABLE "media" DROP COLUMN "_transforms";
  ALTER TABLE "media" DROP COLUMN "original__stored";
  ALTER TABLE "media" DROP COLUMN "variants_thumbnail__stored";
  ALTER TABLE "media" DROP COLUMN "variants_medium__stored";
  ALTER TABLE "media" DROP COLUMN "variants_large__stored";
  ALTER TABLE "users_sessions" DROP COLUMN "refresh_count";
  ALTER TABLE "users_sessions" DROP COLUMN "refreshed_at";`)
}
