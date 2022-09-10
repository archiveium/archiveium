## TODO
- [x] Cover scenario when new folder is added
- [x] Cover scenario when existing folder is deleted
- [x] Cover scenario when password is changed
  - [x] Pause account syncing
  - [x] Send notification to user via email
  - [x] Allow user to change password
- [x] Registration flow (including sending email for verification)
  - [x] Create table `user_invitations` with fields username, accepted (by admin) (bool), email_sent (bool)
  - [x] Create new view for accepting user's interest in using service
    - [x] this page populates entries in `user_invitations`
    - [x] accepted will be false and email_sent will be false
  - [x] A new command will send an email if accepted = true stating user can now register
  - [x] On registration page, a check will be done against `user_invitations` to see if registering user is allowed
- [x] Integrate captcha on all form pages
  - [x] login
  - [x] registration
  - [x] Request invitation
  - [x] Password reset
- [x] User's account password reset functionality
- [x] Add landing page
- [ ] Either save size of message in `emails` table in database and/or allow imposition based on no. of emails
- [ ] Disable search indexing by default
- [ ] Encrypt message by user supplied key - idea is to allow only user to read its own emails
- [ ] Rewrite ProcessDeleteAccounts command to delete values from index before purging db entries

## Roadmap
- [ ] Create wiki and add instructions for self deployment
- [ ] User's account change password functionality (when logged in)
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
- [ ] Write test cases (unit, functional, etc.)
- [ ] Add ability to export archived emails
- [ ] Look into integrating Project Honeypot for spam detection (if current protection isn't enough)
- [ ] Remember me checkbox functionality

## Folder/Label Change (Possible) Scenarios
### Gmail
- [x] Add new folder with same name - uidvalidity changes
  - [x] Add new folder to folders table
- [x] Add new folder with new name - uidvalidity changes
  - [x] Add new folder to folders table
- [x] Rename folder - uidvalidity same
  - [x] Renamed saved folder name
- [x] Move folder under another folder - uidvalidity same
  - [x] Renamed saved folder name
- [x] Delete folder
  - [x] Flag folder as deleted from remote (`deleted_remote = true`)
  - [x] Ignore this folder from future sync jobs

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

## Monitoring
- [ ] Monitor slow queries - Look into using [pgMetrics](https://pgmetrics.io/), postgres `auto_explain` [module](https://www.postgresql.org/docs/current/auto-explain.html) (and [changing log level](https://stackoverflow.com/questions/60186882/how-to-turn-on-the-module-auto-explain))
