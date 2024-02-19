import type { Processor } from "bullmq";
import { BaseQueue } from "./baseQueue";
import { emailVerification } from "$lib/server/jobs/handlers/emailVerification";

export class EmailVerificationQueue extends BaseQueue {
    private name = 'EmailVerification';
    private jobName = 'emailVerification';

    getName(): string {
        return this.name;
    }

    getJobName(): string {
        return this.jobName;
    }

    getProcessor(): Processor {
        return emailVerification;
    }
}