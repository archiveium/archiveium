import { db } from "../database/connection";

export async function insertUserInvitation(username: string) {
    return db.insertInto('user_invitations')
        .values({ username })
        .executeTakeFirstOrThrow();
}

export async function findUserByEmail(email: string) {
    return db.selectFrom('user_invitations')
        .select(['id', 'username', 'accepted', 'notification_sent_at', 'created_at'])
        .where('username', '=', email)
        .executeTakeFirstOrThrow();
}
