## Getting Started

1. Clone this repository `git clone https://github.com/archiveium/archiveium.git`
2. Navigate to newly created directory `cd archiveium`
3. Create `.env` by copy `.env.example` - `cp .env.example .env`
4. Fill out the values in `.env` as per your requirements. Refer to comments in file for more information
5. Bring up the stack - `docker-compose -f docker-compose-prod.yml up -d`

## Roadmap
- [ ] Log email retrieval failures (in progress)
    - [x] Save reason to database
    - [ ] Display to user
    - [ ] Give an option to re-import
    - [ ] Give an option to let user accept that error (and hide from view by default)
- [ ] Migrate to version v0.29 of meilisearch
- [ ] Integrate searching functionality
- [x] Disable search indexing by default
    - [x] Add columns in accounts table `searchable`
    - [ ] Update add account view to show checkbox
    - [ ] Update BuildEmailSearchIndex command to only build index for accounts that have `searchable = true`
    - [ ] When user changes `searchable` to `false` trigger an event that removes account related data from index
- [ ] Rewrite ProcessDeleteAccounts command to delete values from index before purging db entries
- [ ] Save size of message in `emails` table in database
- [ ] User's account change password functionality (when logged in)
- [ ] Enforce quota on accounts
- [ ] Meta data for different views
- [ ] Check for credentials validity before (re)enabling sync
- [ ] User's account deletion option (use Jetstream's password confirmation)
- [ ] Do not pause mailbox sync on first auth failure. Attempt 3 times before triggering email
- [ ] Allow only certain parts of email to be indexed i.e. subject, email address (from, to, etc.), body
- [ ] Allow user to view email attachments (refer PHPMimeMailParser package - `saveAttachments()` for storing attachments)
- [ ] Integrate indexing of attachments (pdf, txt, etc.) - need to check if it is feasible
- [ ] Save one version of email regardless of folder it belongs to (maybe look into hashing raw_message and comparing on update)
- [ ] Log every action (basis for in-app notifications) - look into using Laravel Notifications
- [ ] Compress string in PHP and/or database (or both) to save space. Hint COMPRESS() (mysql), gzcompress() (php)
- [ ] Two-Factor Authentication (2FA)
- [ ] Add coverage report
- [ ] Write test cases (unit, functional, etc.)
- [ ] Bring your own S3 bucket (for saving email data)
- [ ] Add ability to export archived emails
- [ ] Look into integrating Project Honeypot for spam detection (if current protection isn't enough)
- [ ] Remember me checkbox functionality
- [ ] Allow user to define trusted proxies instead of allowing all (the case currently)
- [ ] Populate providers table on first run
- [ ] Based on email address entered on edit account page, try to determine the provider
- [ ] Add select all checkbox on fetched folders on edit account page
- [ ] Look into using job_batches feature of laravel queue for reporting user with completion %age for imports, etc.

## Folder/Label Change (Possible) Scenarios

`Note: In any of the cases mentioned below, no handling is required in terms of S3 objects.`

### Gmail
- [x] Add new folder with new name - uidvalidity changes
  - [x] Add new folder to folders table
- [x] Rename folder - uidvalidity same
  - [x] Renamed saved folder name
- [x] Move folder under another folder - uidvalidity same
  - [x] Renamed saved folder name
- [x] Delete folder
  - [x] Flag folder as deleted from remote (`deleted_remote = true`)
  - [x] Ignore this folder from future sync jobs
- [x] Add new folder with same name - uidvalidity changes
  - [x] Add new folder to folders table

### Outlook
- [x] Add new folder with same name - uidvalidity same
  - [x] Re-enable the deleted folder (`deleted_remote = false`)
- [x] Add new folder with new name - uidvalidity changes
  - [x] Add new folder to folders table
- [x] Rename folder - uidvalidity changes
  - [x] Add new folder to folders table
- [x] Move folder under another folder - uidvalidity changes
  - [x] Add new folder to folders table
- [x] Delete folder
  - [x] Flag folder as deleted from remote (`deleted_remote = true`)
  - [x] Ignore this folder from future sync jobs

### Zoho
- [x] Add new folder with same name - uidvalidity same
  - [x] Re-enable the deleted folder (`deleted_remote = false`)
- [x] Add new folder with new name - uidvalidity same
  - [x] Add new folder to folders table
- [x] Rename folder - uidvalidity sameselec
  - [x] Delete saved folder
  - [x] Add new folder to folders table
- [x] Move folder under another folder - uidvalidity same
  - [x] Delete saved folder
  - [x] Add new folder to folders table
- [x] Delete folder
  - [x] Flag folder as deleted from remote (`deleted_remote = true`)
  - [x] Ignore this folder from future sync jobs
