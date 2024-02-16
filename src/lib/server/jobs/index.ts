import { Queue, Worker, type Processor, type DefaultJobOptions } from 'bullmq';
import { logger } from '../../../utils/logger';
import { userInvitation } from './handlers/userInvitation';
import { redis } from '../redis/connection';
import { passwordReset } from './handlers/passwordReset';
import { emailVerification } from './handlers/emailVerification';
import { syncAccount } from './handlers/syncAccount';
import { syncFolder } from './handlers/syncFolder';
import { importEmail } from './handlers/importEmail';
import { deleteAccount } from './handlers/deleteAccount';
import config from 'config';
import { deleteUser } from './handlers/deleteUser';

export class JobScheduler {
	private userInvitationQueue: Queue;
	private passwordResetQueue: Queue;
	private emailVerificationQueue: Queue;
	private importEmailQueue: Queue;
	private syncAccountQueue: Queue;
	private syncFolderQueue: Queue;
	private deleteAccountQueue: Queue;
	private deleteUserQueue: Queue;

	static QUEUE_USER_INVITATION = 'UserInvitation';
	static QUEUE_PASSWORD_RESET = 'PasswordReset';
	static QUEUE_IMPORT_EMAIL = 'ImportEmail';
	static QUEUE_EMAIL_VERIFICATION = 'EmailVerification';
	static QUEUE_SYNC_ACCOUNT = 'SyncAccount';
	static QUEUE_SYNC_FOLDER = 'SyncFolder';
	static QUEUE_DELETE_ACCOUNT = 'DeleteAccount';
	static QUEUE_DELETE_USER = 'DeleteUser';

	constructor() {
		this.userInvitationQueue = this.buildQueue(JobScheduler.QUEUE_USER_INVITATION);
		this.passwordResetQueue = this.buildQueue(JobScheduler.QUEUE_PASSWORD_RESET);
		this.emailVerificationQueue = this.buildQueue(JobScheduler.QUEUE_EMAIL_VERIFICATION);
		this.syncAccountQueue = this.buildQueue(JobScheduler.QUEUE_SYNC_ACCOUNT);
		this.syncFolderQueue = this.buildQueue(JobScheduler.QUEUE_SYNC_FOLDER);
		this.deleteAccountQueue = this.buildQueue(JobScheduler.QUEUE_DELETE_ACCOUNT);
		this.deleteUserQueue = this.buildQueue(JobScheduler.QUEUE_DELETE_USER);
		this.importEmailQueue = this.buildQueue(JobScheduler.QUEUE_IMPORT_EMAIL, {
			removeOnComplete: true,
			attempts: 3,
			backoff: {
				type: 'exponential',
				delay: 60000 * 2 // 2 minutes
			}
		});
	}

	async initialize(): Promise<void> {
		const useAsCronProcessor = config.get<boolean>('app.useAsCronProcessor');
		if (useAsCronProcessor) {
			logger.info('Initializing scheduler');
			// remove completed jobs
			// await this.userInvitationQueue.clean(0, 1000, 'completed');
			await this.scheduleJobs();
			await this.startWorkers();
			logger.info('Finished initializing scheduler');
			return;
		}

		logger.warn('Skipping initialization of scheduler');
	}

	async addJobToExistingQueue(queue: string, data: unknown) {
		switch (queue) {
			case JobScheduler.QUEUE_IMPORT_EMAIL:
				return this.importEmailQueue.add('importEmail', data);
			default:
				// TODO Throw exception
				break;
		}
	}

	private buildQueue(queueName: string, defaultJobOptions?: DefaultJobOptions): Queue {
		return new Queue(queueName, {
			connection: redis,
			defaultJobOptions
		});
	}

	private async startWorkers(): Promise<void> {
		await this.startWorker(JobScheduler.QUEUE_USER_INVITATION, userInvitation);
		await this.startWorker(JobScheduler.QUEUE_PASSWORD_RESET, passwordReset);
		await this.startWorker(JobScheduler.QUEUE_EMAIL_VERIFICATION, emailVerification);
		await this.startWorker(JobScheduler.QUEUE_SYNC_ACCOUNT, syncAccount);
		await this.startWorker(JobScheduler.QUEUE_SYNC_FOLDER, syncFolder);
		await this.startWorker(JobScheduler.QUEUE_IMPORT_EMAIL, importEmail);
		await this.startWorker(JobScheduler.QUEUE_DELETE_ACCOUNT, deleteAccount);
		await this.startWorker(JobScheduler.QUEUE_DELETE_USER, deleteUser);
	}

	private async startWorker(workerName: string, processor: Processor): Promise<void> {
		logger.info(`Starting worker ${workerName}`);
		const worker = new Worker(workerName, processor, { connection: redis });
		logger.info(`Started worker ${worker.name} (${worker.id})`);
	}

	private async scheduleJobs(): Promise<void> {
		logger.info('Scheduling jobs');
		await this.userInvitationQueue.add('processUserInvitation', null, {
			repeat: {
				every: 60000 // 60 seconds
			},
			removeOnComplete: true
		});
		await this.passwordResetQueue.add('passwordReset', null, {
			repeat: {
				every: 60000 // 60 seconds
			},
			removeOnComplete: true
		});
		await this.emailVerificationQueue.add('emailVerification', null, {
			repeat: {
				every: 60000 // 60 seconds
			},
			removeOnComplete: true
		});
		await this.syncAccountQueue.add('syncAccount', null, {
			repeat: {
				every: 60000 // 60 seconds
			},
			removeOnComplete: true
		});
		await this.syncFolderQueue.add('syncFolder', null, {
			repeat: {
				every: 60000 // 60 seconds
			},
			removeOnComplete: true
		});
		await this.deleteAccountQueue.add('deleteAccount', null, {
			repeat: {
				every: 60000 // 60 seconds
			},
			removeOnComplete: true
		});
		await this.deleteUserQueue.add('deleteUser', null, {
			repeat: {
				every: 60000 // 60 seconds
			},
			removeOnComplete: true
		});
		logger.info('Finishes scheduling jobs');
	}
}
