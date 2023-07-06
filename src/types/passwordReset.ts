export interface BasePasswordResetRequest {
    email: string;
    password_reset_token: string;
}

export interface PasswordResetRequest extends BasePasswordResetRequest {
    id: number;
    email_notified_at: Date;
    created_at: Date;
}

export type NewPasswordRequestRequest = BasePasswordResetRequest