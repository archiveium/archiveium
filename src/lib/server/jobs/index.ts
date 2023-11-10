import { Queue, Worker } from 'bullmq';
import { logger } from "../../../utils/logger";
import { userInvitation } from "./handlers/userInvitation";
import { redis } from '../redis/connection';
import { passwordReset } from './handlers/passwordReset';
import { emailVerification } from './handlers/emailVerification';

export class JobScheduler {
    private userInvitationQueue: Queue;
    private passwordResetQueue: Queue;
    private emailVerificationQueue: Queue;

    constructor() {
        this.userInvitationQueue = new Queue('UserInvitation', {
            connection: redis,
        });
        this.passwordResetQueue = new Queue('PasswordReset', {
            connection: redis,
        });
        this.emailVerificationQueue = new Queue('EmailVerification', {
            connection: redis,
        });
    }

    async initialize() {
        logger.info('Initializing scheduler');

        // remove completed jobs
        // await this.userInvitationQueue.clean(0, 1000, 'completed');

        // schedule jobs
        await this.scheduleJobs();

        // start worker to process scheduled jobs
        await this.startWorkers();
    }

    private async startWorkers(): Promise<void> {
        logger.info('Starting workers');
        let worker: Worker;
        worker = new Worker('UserInvitation', userInvitation, { connection: redis });
        logger.info(`Started worker ${worker.name} (${worker.id})`);
        worker = new Worker('PasswordReset', passwordReset, { connection: redis });
        logger.info(`Started worker ${worker.name} (${worker.id})`);
        worker = new Worker('EmailVerification', emailVerification, { connection: redis });
        logger.info(`Started worker ${worker.name} (${worker.id})`);
    }

    private async scheduleJobs(): Promise<void> {
        logger.info('Scheduling jobs');

        await this.userInvitationQueue.add(
            'processUserInvitation',
            null,
            {
                repeat: {
                    every: 60000, // 60 seconds
                },
                removeOnComplete: true,
            },
        );
        await this.passwordResetQueue.add(
            'passwordReset',
            null,
            {
                repeat: {
                    every: 60000, // 60 seconds
                },
                removeOnComplete: true,
            },
        );
        await this.emailVerificationQueue.add(
            'emailVerification',
            null,
            {
                repeat: {
                    every: 60000, // 60 seconds
                },
                removeOnComplete: true,
            },
        );
    }
}