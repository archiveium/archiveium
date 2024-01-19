import crypto from 'crypto';
import config from 'config';
import { DecryptException } from '../exceptions/encrypter';

const algorithm = 'aes-192-cbc';

function buildKey(): Buffer {
    const encryptionKey = config.get<string>('app.encryptionKey');
    return crypto.scryptSync(encryptionKey, 'salt', 24);
}

export function encrypt(clearText: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, buildKey(), iv);
    const encrypted = cipher.update(clearText, 'utf8', 'hex');
    return [
        encrypted + cipher.final('hex'),
        Buffer.from(iv).toString('hex'),
    ].join('|');
}

export function decrypt(encryptedText: string): string {
    const [encrypted, iv] = encryptedText.split('|');
    if (!iv) {
        throw new DecryptException('Unable to decrypt. Missing IV');
    }

    try {
        const decipher = crypto.createDecipheriv(
            algorithm,
            buildKey(),
            Buffer.from(iv, 'hex')
        );
        return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
    } catch (error) {
        throw new DecryptException('Unable to decrypt. Key error.');
    }
}