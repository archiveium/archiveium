import type { Transaction } from "kysely";
import type { DB } from "../database/types";
import type { EmailFolderInsert } from "../database/wrappers";
import { db } from "../database/connection";

export async function insertEmailFolder(emailFolder: EmailFolderInsert, trx?: Transaction<DB>) {
    const dbObject = trx ?? db;
    return dbObject.insertInto('email_folders')
        .values(emailFolder)
        .returningAll()
        .executeTakeFirstOrThrow();
}