import { RecordNotFoundException } from '../exceptions/database';
import type { Provider } from '../types/provider';
import { sql } from '.';

export function getAllProviders(): Promise<Provider[]> {
	return sql<
		Provider[]
	>`SELECT id, INITCAP(name) AS name, host, port, secure, is_default FROM providers`;
}

export async function getProviderById(id: string): Promise<Provider> {
	const result = await sql<Provider[]>`SELECT id, name, host, port, secure, is_default 
    FROM providers 
    WHERE id = ${id}
    LIMIT 1;`;

	if (result.count > 0) {
		return result[0];
	}

	throw new RecordNotFoundException(`Email provider ${id} not found`);
}
