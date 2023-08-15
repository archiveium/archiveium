import { db } from '$lib/server/database/connection';

export async function findAllProviders() {
    return db.selectFrom('providers')
        .select(({ fn }) => [
            'id', 'host', 'port', 'secure', 'is_default',
            fn.agg<string[]>('initcap', ['name']).as('name')
        ])
        .execute();
}

export async function findProviderById(id: string) {
    return db.selectFrom('providers')
        .select(['id', 'name', 'host', 'port', 'secure', 'is_default'])
        .where('id', '=', id)
        .executeTakeFirstOrThrow();
}
