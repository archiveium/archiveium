import { createHmac } from 'crypto';
import { DateTime } from 'luxon';
import config from 'config';
import type { SessionConfig } from '~/types/config';
import crypto from 'crypto';
import { InvalidUrlSignature, UrlExpired } from '~/exceptions/auth';

export default class SignUrl {
    private url: URL;
    private secret: string;

    constructor(baseUrl: string, private readonly path: string, private readonly expirationInMinutes?: number) {
        const sessionConfig = config.get<SessionConfig>('session');
        this.secret = sessionConfig.secrets[0];
        this.url = new URL(baseUrl);
    }

    getSigned(): string {
        return this.sign(this.url, this.path, this.expirationInMinutes);
    }

    compareSignature(signature: string, expires: number): boolean {
        const hasCorrectSignature = this.hasCorrectSignature(signature, expires);
        const hasExpired = this.hasExpired(expires);
        if (hasExpired) {
            throw new UrlExpired('Url has expired. Please try again.');
        } else if (!hasCorrectSignature) {
            throw new InvalidUrlSignature('Invalid url signature.');
        }
        return hasCorrectSignature && hasExpired;
    }

    hasCorrectSignature(signature: string, expires: number): boolean {
        const args = [this.path, expires.toString()];
        const compare = this.createHmac(args);
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(compare));
    }

    hasExpired(expires: number): boolean {
        if (expires) {
            const currentDate = DateTime.now().toMillis();
            const expireDate = DateTime.fromMillis(expires).toMillis();
            return currentDate > expireDate;
        }
        return false;
    }

    private sign(url: URL, path: string, expiration?: number): string {
        const args = [path];
        if (expiration && expiration > 0) {
            const dateTime = DateTime.now().plus({ minutes: expiration }).toMillis().toString();
            args.push(dateTime);
            url.searchParams.set('expires', args[1]);
        }

        const hash = this.createHmac(args);
        url.searchParams.set('signature', hash);
        url.pathname = path;

        return url.href;
    }

    private createHmac(args: string[]): string {
        return createHmac('sha256', this.secret)
            .update(args.join(';'))
            .digest('hex');
    }
}