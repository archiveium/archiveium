import { db } from '../database/connection';
import { sql } from 'kysely';

export async function insertUserInvitation(username: string) {
	return db.insertInto('user_invitations').values({ username }).executeTakeFirstOrThrow();
}

export async function findUserInvitationByEmail(email: string) {
	return db
		.selectFrom('user_invitations')
		.select(['id', 'username', 'accepted', 'notification_sent_at', 'created_at'])
		.where('username', '=', email)
		.executeTakeFirstOrThrow();
}

export async function findAllInvitedUsers() {
	return db
		.selectFrom('user_invitations as ui')
		.select(['ui.id', 'ui.username'])
		.leftJoin('users as u', 'u.email', 'ui.username')
		.where('ui.accepted', '=', true)
		.where('ui.notification_sent_at', 'is', null)
		.where('u.id', 'is', null)
		.execute();
}

export async function updateInvitedUser(id: string) {
	return db
		.updateTable('user_invitations')
		.set(() => ({
			notification_sent_at: sql<string>`NOW()`
		}))
		.where('id', '=', id)
		.execute();
}
