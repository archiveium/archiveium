import { db } from "../database/connection";
import { sql } from 'kysely';

export async function insertUserInvitation(username: string) {
    return db.insertInto('user_invitations')
        .values({ username })
        .executeTakeFirstOrThrow();
}

export async function findUserInvitationByEmail(email: string) {
    return db.selectFrom('user_invitations')
        .select(['id', 'username', 'accepted', 'notification_sent_at', 'created_at'])
        .where('username', '=', email)
        .executeTakeFirstOrThrow();
}

export async function findAllInvitedUsers() {
    return db.selectFrom('user_invitations')
        .select(['id', 'username'])
        .where('accepted', '=', true)
        .where('notification_sent_at', 'is', null)
        .execute();
}

export async function updateInvitedUser(id: string) {
    return db.updateTable('user_invitations')
        .set((eb) => ({
            notification_sent_at: sql<string>`NOW()`,
        }))
        .where('id', '=', id)
        .execute();
}