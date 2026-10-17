import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { migrateSizesToVariants } from '@payloadcms/db-postgres/migration-utils'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
    await migrateSizesToVariants({ db, payload })
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
    await migrateSizesToVariants({ db, direction: 'down', payload })
}
