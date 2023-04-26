import crypto from 'crypto';

export function hashPassword(rawPassword: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = (crypto.scryptSync(rawPassword, salt, 64) as Buffer).toString('hex');
    return `${salt}:${derivedKey}`;
}