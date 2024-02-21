export type JobCount = {
	name: string;
	status: {
		[index: string]: number;
	};
};
