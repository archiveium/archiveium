import { Queue, Worker, type Processor, type DefaultJobOptions } from 'bullmq';
import { logger } from "../../../utils/logger";
import { userInvitation } from "./handlers/userInvitation";
import { redis } from '../redis/connection';
import { passwordReset } from './handlers/passwordReset';
import { emailVerification } from './handlers/emailVerification';

export class JobScheduler {
    private userInvitationQueue: Queue;
    private passwordResetQueue: Queue;
    private emailVerificationQueue: Queue;
    private importEmailQueue: Queue;

    static QUEUE_USER_INVITATION = 'UserInvitation';
    static QUEUE_PASSWORD_RESET = 'PasswordReset';
    static QUEUE_IMPORT_EMAIL = 'ImportEmail';
    static QUEUE_EMAIL_VERIFICATION = 'EmailVerification';

    constructor() {
        this.userInvitationQueue = this.buildQueue(JobScheduler.QUEUE_USER_INVITATION);
        this.passwordResetQueue = this.buildQueue(JobScheduler.QUEUE_PASSWORD_RESET);
        this.emailVerificationQueue = this.buildQueue(JobScheduler.QUEUE_EMAIL_VERIFICATION);
        this.importEmailQueue = this.buildQueue(JobScheduler.QUEUE_IMPORT_EMAIL, {
            removeOnComplete: true,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 60000 * 2,   // 2 minutes
            }            
        });
    }

    async initialize() {
        logger.info('Initializing scheduler');
        // remove completed jobs
        // await this.userInvitationQueue.clean(0, 1000, 'completed');
        await this.scheduleJobs();
        await this.startWorkers();
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
        logger.info('Starting workers');
        await this.startWorker(JobScheduler.QUEUE_USER_INVITATION, userInvitation);
        await this.startWorker(JobScheduler.QUEUE_PASSWORD_RESET, passwordReset);
        await this.startWorker(JobScheduler.QUEUE_EMAIL_VERIFICATION, emailVerification);
    }

    private async startWorker(workerName: string, processor: Processor): Promise<void> {
        const worker = new Worker(workerName, processor, { connection: redis });
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