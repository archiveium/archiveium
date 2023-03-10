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