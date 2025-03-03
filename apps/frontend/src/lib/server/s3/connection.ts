import { S3Client } from '@aws-sdk/client-s3';
import config from 'config';
import type { S3Config } from '../../../types/config';
import { logger } from '../../../utils/logger';

// We are doing this stringify/parse because starting v3.667.0 of aws js sdk
// AWS SDK started mutating config object internally for credential management
// $source is what is being mutated
const s3Config: S3Config = JSON.parse(JSON.stringify(config.get('s3')));
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
