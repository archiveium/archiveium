import { Queue, Worker } from 'bullmq';
import { logger } from "../../../utils/logger";
import { userInvitation } from "./handlers/userInvitation";
import { redis } from '../redis/connection';

export class JobScheduler {
    private userInvitationQueue: Queue;

    constructor() {
        this.userInvitationQueue = new Queue('UserInvitation', {
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
        const worker = new Worker('UserInvitation', userInvitation, { connection: redis });
        logger.info(`Started worker ${worker.name} (${worker.id})`);
    }

    private async scheduleJobs(): Promise<void> {
        logger.info('Scheduling jobs');

        // Repeat job every 10 seconds but no more than 100 times
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
    }
}