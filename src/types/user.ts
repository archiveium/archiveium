export interface SessionUser {
	id: string;
	name: string;
	email: string;
	admin: boolean;
}

export interface CreateUser {
	name: string;
	email: string;
	password: string;
}

export interface User extends CreateUser {
	id: number;
	email_notified_at: Date;
	email_verified_at: Date;
}

export interface InvitedUser {
	id: number;
	username: string;
	accepted: boolean;
	notification_sent_at: Date;
	created_at: Date;
}
