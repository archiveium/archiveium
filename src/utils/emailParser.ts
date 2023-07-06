import type { ParsedMail} from "mailparser";
import { simpleParser } from "mailparser";
import { EmailSourceUndefinedException } from "../exceptions/emailParser";

export async function parseEmail(source?: string): Promise<ParsedMail> {
    if (source) {
        const parsedEmail = await simpleParser(source);
        return parsedEmail;
    }

    throw new EmailSourceUndefinedException('Source is undefined');
}