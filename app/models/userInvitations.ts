import type { InvitedUser } from "~/types/user";
import { UserNotInvitedException } from '~/exceptions/auth';
import { sql } from ".";

export async function insertUserInvitation(username: string): Promise<void> {
    await sql`INSERT INTO user_invitations(username)
    VALUES(${username})`;
}

export async function getInvitedUser(email: string): Promise<InvitedUser> {
    const result = await sql<InvitedUser[]>`SELECT id, username, accepted, notification_sent_at, created_at 
    FROM user_invitations 
    WHERE username = ${email};`;
    if (result.count > 0) {
        return result[0];
    }
    throw new UserNotInvitedException(`${email} has not been invited`);
}