<?php
namespace App\Helpers;

use App\Exceptions\MissingConfigException;
use App\Models\Email;
use Aws\CommandPool;
use Aws\Exception\AwsException;
use Aws\ResultInterface;
use Aws\S3\Exception\S3Exception;
use Aws\S3\S3Client;
use GuzzleHttp\Promise\PromiseInterface;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use PhpMimeMailParser\Parser;

class S3Helper
{
    private const OBJECT_EXTENSION = '.eml';

    /**
     * @param S3Client $client
     * @param Collection $emails
     * @return bool
     * @throws MissingConfigException
     */
    public static function bulkInsert(S3Client $client, Collection $emails): bool
    {
        $bucket = self::getBucketName();
        $commands = [];

        /**
         * @var $email Email
         */
        foreach ($emails as $email) {
            $commands[] = $client->getCommand(
                'PutObject',
                [
                    'Bucket' => $bucket,
                    'Key' => self::buildObjectPath($email->user_id, $email->folder_id, $email->message_number),
                    'Body' => $email->getMessageBody()
                ]
            );
        }

        $pool = new CommandPool($client, $commands, [
            // Only send 25 files at a time
            'concurrency' => 25,
            // Invoke this function for each failed transfer
            'rejected' => function (AwsException $reason, $iterKey, PromiseInterface $aggregatePromise) {
                $aggregatePromise->reject($reason);
            },
        ]);

        try {
            $promise = $pool->promise();
            $promise->wait();
        } catch (AwsException $e) {
            // TODO Delete all inserted email objects
            Log::error($e->getMessage());
            throw $e;
        }

        return true;
    }

    /**
     * @param S3Client $client
     * @param array $emails
     * @param bool $parseBody
     * @return array
     * @throws MissingConfigException
     */
    public static function bulkGet(S3Client $client, array $emails, bool $parseBody = false): array
    {
        $bucket = self::getBucketName();
        $commands = [];

        /**
         * @var $email Email
         */
        foreach ($emails as $email) {
            $commands[] = $client->getCommand(
                'GetObject',
                [
                    'Bucket' => $bucket,
                    'Key' => self::buildObjectPath($email->user_id, $email->folder_id, $email->message_number),
                ]
            );
        }

        $parser = new Parser();
        $pool = new CommandPool($client, $commands, [
            // Only send 25 files at a time
            'concurrency' => 25,
            // Invoke this function for each successful transfer
            'fulfilled' => function (ResultInterface $result, $iterKey, PromiseInterface $aggregatePromise) use ($parser, $emails, $parseBody) {
                $parser->setText((string) $result->get('Body'));

                /**
                 * @var $email Email
                 */
                $email = $emails[$iterKey];

                $email->setParsedSubjectAttribute($parser->getHeader('subject'));
                $email->setParsedFromAddressAttribute(
                    implode(
                        '',
                        Arr::pluck($parser->getAddresses('from'), 'address')
                    )
                );

                if ($parseBody) {
                    $email->setContentTypeAttribute($parser->getHeader('content-type'));
                    $messageBody = $parser->getMessageBody(Email::TYPE_HTML);
                    if (empty($messageBody)) {
                        $messageBody = $parser->getMessageBody();
                    }
                    $email->setMessageBody($messageBody);
                }
            },
            // Invoke this function for each failed transfer
            'rejected' => function (AwsException $reason, $iterKey, PromiseInterface $aggregatePromise) {
                $aggregatePromise->reject($reason);
            },
        ]);

        try {
            $promise = $pool->promise();
            $promise->wait();
        } catch (AwsException $e) {
            Log::error($e->getMessage());
            throw $e;
        }

        return $emails;
    }

    /**
     * @param S3Client $s3Client
     * @param int $userId
     * @param int $folderId
     * @return bool
     * @throws MissingConfigException
     */
    public static function deletePath(S3Client $s3Client, int $userId, int $folderId): bool
    {
        $bucket = self::getBucketName();
        $objectPath = self::buildObjectPath($userId, $folderId, 0, true);

        Log::info('Deleting object', ['path' => $objectPath]);

        $promise = $s3Client->deleteMatchingObjectsAsync($bucket, $objectPath);

        try {
            $promise->wait();
            return true;
        } catch (S3Exception $exception) {
            Log::error($exception->getMessage());
        }

        return false;
    }

    /**
     * @param int $userId
     * @param int $folderId
     * @param int $messageNumber
     * @param bool $buildPrefix
     * @return string
     */
    private static function buildObjectPath(int $userId, int $folderId, int $messageNumber, bool $buildPrefix = false): string
    {
        return join(
            '/',
            [
                $userId,
                $folderId,
                self::buildObjectName($userId, $folderId, $messageNumber, $buildPrefix)
            ]
        );
    }

    /**
     * @param int $userId
     * @param int $folderId
     * @param int $messageNumber
     * @param bool $buildPrefix
     * @return string
     */
    private static function buildObjectName(int $userId, int $folderId, int $messageNumber, bool $buildPrefix = false): string
    {
        $objectName = join('_', [$userId, $folderId]);

        if ($buildPrefix) {
            $objectName .= '_';
        } else {
            $objectName = join('_', [$objectName, $messageNumber . self::OBJECT_EXTENSION]);
        }

        return $objectName;
    }

    /**
     * @return string
     * @throws MissingConfigException
     */
    public static function getBucketName(): string
    {
        $path = 'filesystems.disks.s3.bucket';
        $bucket = config($path);

        if (empty($bucket)) {
            throw new MissingConfigException($path);
        }

        return $bucket;
    }
}
