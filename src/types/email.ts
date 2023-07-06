export interface Email {
	id: string;
	folder_id: string;
	udate: Date;
	formatted_date: string;
	has_attachments: boolean;
	message_number: string;
	s3Data?: {
		subject: string;
		from: string;
	};
}
