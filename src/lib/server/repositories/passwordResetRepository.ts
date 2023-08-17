import type { NewPasswordRequestRequest } from "../../../types/passwordReset";
import { db } from "../database/connection";

export async function findPasswordResetRequestByEmail(email: string) {
    return db.selectFrom('password_resets')
        .selectAll()
        .where('email', '=', email)
        .executeTakeFirstOrThrow();
}

export async function deletePasswordResetRequestById(id: string) {
    return db.deleteFrom('password_resets')
        .where('id', '=', id)
        .executeTakeFirst();
}

export async function createPasswordResetRequest(passwordResetRequest: NewPasswordRequestRequest) {
    return db.insertInto('password_resets')
        .values(passwordResetRequest)
        .executeTakeFirstOrThrow();
}

export async function deletePasswordResetRequestByEmail(email: string) {
    return db.deleteFrom('password_resets')
        .where('email', '=', email)
        .executeTakeFirst();
}

export async function findPasswordResetRequestByTokenAndEmail(token: string, email: string) {
    return db.selectFrom('password_resets')
        .selectAll()
        .where('email', '=', email)
        .where('password_reset_token', '=', token)
        .executeTakeFirstOrThrow();
}
