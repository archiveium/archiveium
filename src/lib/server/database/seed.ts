import { logger } from "../../../utils/logger";
import { db } from "./connection";
import type { ProviderInsert } from "./wrappers";

const providers: Array<ProviderInsert> = [
    {
        name: 'gmail',
        host: 'imap.gmail.com',
        port: 993,
        secure: true,
        is_default: true,
        check_email_id: true,
    },
    {
        name: 'zoho (free)',
        host: 'imappro.zoho.com',
        port: 993,
        secure: true,
        is_default: false,
        check_email_id: false,
    },
    {
        name: 'outlook (free)',
        host: 'outlook.office365.com',
        port: 993,
        secure: true,
        is_default: false,
        check_email_id: false,
    }
];

export async function seedDatabase() {
    try {
        const insertResult = await db.insertInto('providers')
            .values(providers)
            .onConflict((oc) => oc.columns(['name', 'host']).doNothing())
            .returningAll()
            .execute();
        logger.info(`Inserted ${insertResult.length} rows in providers table`);
    } catch (error) {
        logger.error(error);
        throw error;
    }
}