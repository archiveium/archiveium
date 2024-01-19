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
	name: string;
	url: string;
	logLevel: string;
}

export interface S3Config {
	region: string;
	endpoint: string;
	credentials: {
		accessKeyId: string;
		secretAccessKey: string;
	};
	forcePathStyle: boolean;
}

export interface MailConfig {
	host: string;
	port: number;
	secure: boolean;
	auth: {
		user: string;
		pass: string;
	};
	fromAddress: string;
}
