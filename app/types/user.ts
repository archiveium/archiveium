export interface User {
    name: string;
    email: string;
    password: string;
    email_notified_at?: Date;
    email_verified_at?: Date;
}