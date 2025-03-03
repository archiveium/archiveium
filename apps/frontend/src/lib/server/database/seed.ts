import { ZodError } from 'zod';
import { logger } from '../../../utils/logger';
import { db } from './connection';
import type { ProviderInsert } from './wrappers';
import config from 'config';
import * as userService from '$lib/server/services/userService';

const providers: Array<ProviderInsert> = [
	{
		name: 'gmail',
		host: 'imap.gmail.com',
		port: 993,
		secure: !(config.util.getEnv('NODE_ENV').toString() === 'development'),
		is_default: true,
		check_email_id: true
	},
	{
		name: 'zoho (free)',
		host: 'imappro.zoho.com',
		port: 993,
		secure: true,
		is_default: false,
		check_email_id: false
	},
	{
		name: 'outlook (free)',
		host: 'outlook.office365.com',
		port: 993,
		secure: true,
		is_default: false,
		check_email_id: false
	}
];

if (config.util.getEnv('NODE_ENV').toString() === 'development') {
	providers.push({
		name: 'smtp4dev',
		host: 'smtp4dev',
		port: 143,
		secure: false,
		is_default: true,
		check_email_id: true
	});
}

export async function seedDatabase() {
	try {
		const insertResult = await db
			.insertInto('providers')
			.values(providers)
			.onConflict((oc) => oc.columns(['name', 'host']).doNothing())
			.returningAll()
			.execute();
		logger.info(`Inserted ${insertResult.length} rows in providers table`);
	} catch (error) {
		logger.error(error);
		throw error;
	}
}

export async function createAdminUser() {
	const adminEmail = config.get<string>('app.adminEmail');
	const adminPassword = config.get<string>('app.adminPassword');
	try {
		const adminUserCount = await userService.findAdminUserCount();
		if (adminUserCount > 0) {
			logger.info('Skipping admin user creation. Already exists.');
		} else {
			await userService.createAdminUser(adminEmail, adminPassword);
			logger.info('Created admin user successfully.');
		}
	} catch (error) {
		if (error instanceof ZodError) {
			logger.error(
				`Encountered following errors while creating admin user: ${JSON.stringify(
					error.flatten().fieldErrors
				)}`
			);
		}
		throw error;
	}
}
