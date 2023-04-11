import type { Email } from "~/types/email";
import { sql } from ".";

export async function getAllEmailsByFolderAndUserId(userId: string, folderId: string): Promise<Email[]> {
    return sql<Email[]>`SELECT id, TO_CHAR(udate, 'Mon DD, YYYY') as formatted_date, has_attachments, message_number FROM emails 
        WHERE user_id = ${userId} AND folder_id = ${folderId} AND imported = true
        ORDER BY udate DESC
        LIMIT 15;`;
}