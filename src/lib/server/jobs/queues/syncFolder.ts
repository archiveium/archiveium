import type { Processor } from "bullmq";
import { BaseQueue } from "./baseQueue";
import { syncFolder } from "$lib/server/jobs/handlers/syncFolder";

export class SyncFolderQueue extends BaseQueue {
    private name = 'SyncFolder';
    private jobName = 'syncFolder';

    getName(): string {
        return this.name;
    }

    getJobName(): string {
        return this.jobName;
    }

    getProcessor(): Processor {
        return syncFolder;
    }
}