import * as s3Service from '$lib/server/services/s3Service';
import * as emailService from '$lib/server/services/emailService';
import { expect, describe, it, vi, afterEach } from 'vitest';
import { s3Client } from '$lib/server/s3/connection';
import type { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { sdkStreamMixin } from '@smithy/util-stream';
import { Readable } from 'stream';

describe('s3Service', () => {
    afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('findEmailsByFolderIdAndUserId', () => {
		it('should return email with s3 data when email in given folder has source', async () => {
			// arrange
            const userId = '1';
			const emailId = '12345667890';
			const folderId = '1234';
			const findEmailByFolderIdAndUserIdSpy = vi.spyOn(emailService, 'findEmailByFolderIdAndUserId');
            const findEmailByIdAndUserIdSpy = vi.spyOn(emailService, 'findEmailByIdAndUserId');
            const s3SendSpy = vi.spyOn(s3Client, 'send');
            const email = {
                id: '1',
                email_id: emailId,
                message_number: 1234,
                udate: new Date(),
                has_attachments: false,
                formatted_date: 'date',
                has_source: true,
                folder_id: folderId,
            };
            const emailWithSource = {...email, folder_id: folderId};
            const stream = new Readable();
            stream.push('test string');
            stream.push(null); // end of stream
            const sdkStream = sdkStreamMixin(stream);
            const s3Data: GetObjectCommandOutput = {
                $metadata: {},
                Body: sdkStream
            };
			findEmailByFolderIdAndUserIdSpy.mockResolvedValueOnce([email]);
            // @ts-ignore argument mismatch error
            s3SendSpy.mockResolvedValueOnce(s3Data);

			// act
			const result = await s3Service.findEmailsByFolderIdAndUserId(userId, folderId, '1', 5);

			// assert
			expect(result).toStrictEqual([{ ...email, s3Data: { from: 'Not Available', subject: 'Not Available' } }]);
			expect(findEmailByFolderIdAndUserIdSpy).toHaveBeenCalledWith(userId, folderId, '1', 5);
            expect(findEmailByIdAndUserIdSpy).not.toHaveBeenCalled();
            expect(s3SendSpy.mock.calls[0][0].input).toMatchObject({ Bucket: 'emails', Key: `${userId}/${folderId}/${emailWithSource.id}.eml` });
		});

		it('should return email with s3 data when email in given folder does not have source', async () => {
			// arrange
            const userId = '1';
			const emailId = '12345667890';
			const folderId = '1234';
			const findEmailByFolderIdAndUserIdSpy = vi.spyOn(emailService, 'findEmailByFolderIdAndUserId');
            const findEmailByIdAndUserIdSpy = vi.spyOn(emailService, 'findEmailByIdAndUserId');
            const s3SendSpy = vi.spyOn(s3Client, 'send');
            const email = {
                id: '1',
                email_id: emailId,
                message_number: 1234,
                udate: new Date(),
                has_attachments: false,
                formatted_date: 'date',
                has_source: false,
                folder_id: folderId,
            };
            const emailWithSource = {...email, folder_id: folderId};
            const stream = new Readable();
            stream.push('test string');
            stream.push(null); // end of stream
            const sdkStream = sdkStreamMixin(stream);
            const s3Data: GetObjectCommandOutput = {
                $metadata: {},
                Body: sdkStream
            };
			findEmailByFolderIdAndUserIdSpy.mockResolvedValueOnce([email]);
            findEmailByIdAndUserIdSpy.mockResolvedValueOnce(emailWithSource);
            // @ts-ignore argument mismatch error
            s3SendSpy.mockResolvedValueOnce(s3Data);

			// act
			const result = await s3Service.findEmailsByFolderIdAndUserId(userId, folderId, '1', 5);

			// assert
			expect(result).toStrictEqual([{ ...email, s3Data: { from: 'Not Available', subject: 'Not Available' } }]);
			expect(findEmailByFolderIdAndUserIdSpy).toHaveBeenCalledWith(userId, folderId, '1', 5);
            expect(findEmailByIdAndUserIdSpy).toHaveBeenCalledWith(userId, email.id);
            expect(s3SendSpy.mock.calls[0][0].input).toMatchObject({ Bucket: 'emails', Key: `${userId}/${folderId}/${emailWithSource.id}.eml` });
		});
    });
});
