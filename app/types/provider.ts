export interface Provider {
    id: string;
    name: string;
    host: string;
    port: number;
    secure: boolean;
    is_default: boolean;
}