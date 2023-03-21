export interface Provider {
    name: string;
    host: string;
    port: number;
    secure: boolean;
    is_default: boolean;
}