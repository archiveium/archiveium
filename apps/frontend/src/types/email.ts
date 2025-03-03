export interface Email {
	id: string;
	email_id: string | null;
	udate: Date;
	formatted_date: string;
	has_attachments: boolean;
	message_number: number;
	s3Data?: {
		subject: string;
		from: string;
	};
}
