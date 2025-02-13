import { Job, UnrecoverableError } from "bullmq";
import { logger } from "../../../../utils/logger";

export abstract class BaseHandler {
    public readonly jobName: string;
    abstract handle(): Promise<void>;

    constructor(private readonly job: Job) {
        this.jobName = job.name;
    }

    getJobData<T>(): T {
        return this.job.data as T;
    }

    getJobId(): string | undefined {
        return this.job.id;
    }

    async execute(): Promise<void> {
        logger.info(`${this.jobName}: Running job`);

        const controller = new AbortController();
        // const signal = controller.signal;

        const timer = setTimeout(() => { 
            logger.info(`${this.jobName}: Aborting operation due to timeout`);
            controller.abort()
        }, 1000);

        try {
            await Promise.race([
                new Promise((resolve, reject) => {
                    controller.signal.addEventListener('abort', () => {
                        reject(new Error('Race condition aborted'));
                    });
                }),
                this.handle()
            ]);
            logger.info(`${this.jobName}: Finished running job`);
        } catch (err: any) {
            logger.info(err);
            if (err.name == "AbortError") {
                logger.info(`${this.jobName}: Operation was aborted as expected`);
                throw new UnrecoverableError("Timeout");
            } else {
                throw err;
            }
        } finally {
            clearTimeout(timer);
        }
    }
}