import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "interviews_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" jsonb NOT NULL
  );
  
  ALTER TABLE "interviews_questions" ADD CONSTRAINT "interviews_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."interviews"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "interviews_questions_order_idx" ON "interviews_questions" USING btree ("_order");
  CREATE INDEX "interviews_questions_parent_id_idx" ON "interviews_questions" USING btree ("_parent_id");
  ALTER TABLE "interviews" DROP COLUMN "project_details_objectives";
  ALTER TABLE "interviews" DROP COLUMN "project_details_impacts";
  ALTER TABLE "interviews" DROP COLUMN "project_details_challenges";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "interviews_questions" CASCADE;
  ALTER TABLE "interviews" ADD COLUMN "project_details_objectives" jsonb NOT NULL;
  ALTER TABLE "interviews" ADD COLUMN "project_details_impacts" jsonb NOT NULL;
  ALTER TABLE "interviews" ADD COLUMN "project_details_challenges" jsonb NOT NULL;`)
}
