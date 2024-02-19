import type { Processor } from "bullmq";
import { BaseQueue } from "./baseQueue";
import { deleteUser } from "$lib/server/jobs/handlers/deleteUser";

export class deleteUserQueue extends BaseQueue {
    private name = 'DeleteUser';
    private jobName = 'deleteUser';

    getName(): string {
        return this.name;
    }

    getJobName(): string {
        return this.jobName;
    }

    getProcessor(): Processor {
        return deleteUser;
    }
}