import { RecordDeleteFailedException, RecordNotFoundException } from "../exceptions/database";
import type { NewPasswordRequestRequest, PasswordResetRequest } from "../types/passwordReset";
import { sql } from ".";

export async function getPasswordResetRequestByEmail(email: string): Promise<PasswordResetRequest> {
    const result = await sql<PasswordResetRequest[]>`SELECT * FROM password_resets
    WHERE email = ${email} 
    LIMIT 1`;
    if (result.count > 0) {
        return result[0];
    }
    throw new RecordNotFoundException(`No password reset token exists for email: ${email}`);
}

export async function deletePasswordResetRequestById(id: number): Promise<void> {
    const result = await sql<PasswordResetRequest[]>`DELETE FROM password_resets WHERE id = ${id}`;
    if (result.count < 1) {
        throw new RecordDeleteFailedException(`Failed to delete password request id: ${id}`);
    }
}

export async function createPasswordResetRequest(passwordResetRequest: NewPasswordRequestRequest): Promise<void> {
    await sql`INSERT INTO password_resets ${sql(passwordResetRequest)}`;
}

export async function deletePasswordResetRequestByEmail(email: string): Promise<void> {
    await sql`DELETE FROM password_resets WHERE email = ${email}`;
}

export async function getPasswordResetRequestByTokenAndEmail(token: string, email: string): Promise<PasswordResetRequest> {
    // TODO Use sql() to make params sql safe
    const result = await sql<PasswordResetRequest[]>`SELECT * FROM password_resets
    WHERE email = ${email} AND password_reset_token = ${token}
    LIMIT 1`;
    if (result.count > 0) {
        return result[0];
    }
    throw new RecordNotFoundException(`No password reset request found for token: ${token} and email: ${email}`);
}