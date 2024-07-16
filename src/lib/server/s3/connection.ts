import { S3Client } from '@aws-sdk/client-s3';
import config from 'config';
import type { S3Config } from '../../../types/config';
import { logger } from '../../../utils/logger';

const s3Config = config.get<S3Config>('s3');
let s3Client: S3Client;

try {
	s3Client = new S3Client(s3Config);
} catch (error) {
	if (error instanceof Error) {
		logger.error(error.message);
	}
	throw error;
}

export { s3Client };
