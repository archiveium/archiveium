import config from 'config';
import * as nodemailer from 'nodemailer';
import type { MailConfig } from '../../types/config';

const mailConfig = config.get<MailConfig>('mail');
let transporter;

if (config.util.getEnv('NODE_ENV').toString() === 'development') {
    transporter = nodemailer.createTransport({
        host: mailConfig.host,
        port: mailConfig.port
    });
} else {
    transporter = nodemailer.createTransport(mailConfig);
}

export const mailTransporter = transporter;