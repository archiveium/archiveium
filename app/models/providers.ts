import type { Provider } from "~/types/provider";
import { sql } from ".";

export function getAllProviders(): Promise<Provider[]> {
    return sql<Provider[]>`SELECT name, host, port, secure, is_default FROM providers`;
}