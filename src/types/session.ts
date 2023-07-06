import type { SessionUser } from "./user";

export interface FlashMessage {
    type: 'success' | 'error';
    message: string;
}

export interface SessionData {
    user?: SessionUser;
    flashMessage?: FlashMessage;
}