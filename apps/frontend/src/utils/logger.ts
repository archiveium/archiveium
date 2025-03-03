import config from 'config';
import { pino } from 'pino';

export const logger = pino({
	level: config.get<string>('app.logLevel'),
	transport: {
		target: 'pino-pretty'
	}
});
