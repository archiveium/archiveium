import type { Count } from "~/types/db";
import type { Email } from "~/types/email";
import { sql } from ".";

export async function getAllEmailsByFolderAndUserId(userId: string, folderId: string, currentPage: string): Promise<Email[]> {
    const page = Number(currentPage);
    const offset = page === 1 ? '0' : (page - 1) * 15;
    return sql<Email[]>`SELECT id, TO_CHAR(udate, 'Mon DD, YYYY') as formatted_date, has_attachments, message_number FROM emails 
        WHERE user_id = ${userId} AND folder_id = ${folderId} AND imported = true
        ORDER BY udate DESC
        OFFSET ${offset}
        LIMIT 15;`;
}

export async function getAllEmailsCountByFolderAndUserId(userId: string, folderId: string): Promise<number> {
    const result = await sql<Count[]>`SELECT COUNT(*) FROM emails 
        WHERE user_id = ${userId} AND folder_id = ${folderId} AND imported = true`;
    return result[0].count;
}