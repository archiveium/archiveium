export interface Email {
	id: string;
	email_id: string;
	udate: Date;
	formatted_date: string;
	has_attachments: boolean;
	message_number: string;
	s3Data?: {
		subject: string;
		from: string;
	};
}
