import { PostgresError } from "postgres";
import type { Provider } from "~/types/provider";
import { sql } from "../app/models";

const providers: Array<Provider> = [
    {
        name: 'gmail',
        host: 'imap.gmail.com',
        port: 993,
        secure: true,
        is_default: true,
    },
    {
        name: 'zoho (free)',
        host: 'imappro.zoho.com',
        port: 993,
        secure: true,
        is_default: false,
    },
    {
        name: 'outlook (free)',
        host: 'outlook.office365.com',
        port: 993,
        secure: true,
        is_default: false,
    }    
];

async function seed() {
    try {
        const result = await sql`INSERT INTO providers ${ sql(providers, 'name', 'host', 'port', 'secure', 'is_default') }`;
        console.log(result.count);
        process.exit(0);
    } catch (error) {
        if (error instanceof PostgresError) {
            console.log(error.message);
            console.log(error.code);
        } else {
            console.log(error);
        }
        process.exit(1);
    }
}

seed();