import { sql } from ".";

export async function insertUserInvitation(username: string): Promise<void> {
    await sql`INSERT INTO user_invitations(username)
    VALUES(${username})`;
}