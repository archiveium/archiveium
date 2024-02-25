export type JobCount = {
	jobName: string;
	displayName: string;
	status: {
		[index: string]: number;
	};
};
