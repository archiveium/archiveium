export interface RedisConfig {
    host: string;
    port: number;
}

export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
}

export interface SessionConfig {
    secrets: Array<string>;
}

export interface AppConfig {
    url: string;
}