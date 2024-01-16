import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Int8 = ColumnType<string, string | number | bigint, string | number | bigint>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Accounts {
  id: Generated<Int8>;
  name: string;
  email: string;
  password: string;
  user_id: Int8;
  provider_id: Int8;
  syncing: Generated<boolean | null>;
  deleted: Generated<boolean | null>;
  searchable: Generated<boolean | null>;
  created_at: Generated<Timestamp | null>;
  updated_at: Generated<Timestamp | null>;
}

export interface EmailFolders {
  id: Generated<Int8>;
  email_id: Generated<Int8>;
  folder_id: Generated<Int8>;
  has_source: boolean;
}

export interface Emails {
  id: Generated<Int8>;
  user_id: Generated<Int8>;
  account_id: Generated<Int8>;
  email_id: Int8 | null;
  message_number: number;
  udate: Timestamp;
  has_attachments: boolean;
  imported: boolean;
  import_fail_reason: string | null;
  size_total: Int8;
  size_without_attachments: Int8;
  created_at: Generated<Timestamp | null>;
}

export interface Folders {
  id: Generated<Int8>;
  user_id: Generated<Int8>;
  account_id: Generated<Int8>;
  name: string;
  status_uidvalidity: number;
  last_updated_msgno: number | null;
  syncing: Generated<boolean | null>;
  deleted: Generated<boolean | null>;
  deleted_remote: Generated<boolean | null>;
  created_at: Generated<Timestamp | null>;
  updated_at: Generated<Timestamp | null>;
}

export interface PasswordResets {
  id: Generated<Int8>;
  email: string;
  password_reset_token: string;
  email_notified_at: Timestamp | null;
  created_at: Generated<Timestamp | null>;
}

export interface Providers {
  id: Generated<Int8>;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  is_default: boolean;
  check_email_id: boolean;
  created_at: Generated<Timestamp | null>;
  updated_at: Generated<Timestamp | null>;
}

export interface UserInvitations {
  id: Generated<Int8>;
  username: string;
  accepted: Generated<boolean | null>;
  notification_sent_at: Timestamp | null;
  created_at: Generated<Timestamp | null>;
}

export interface Users {
  id: Generated<Int8>;
  name: string;
  email: string;
  password: string;
  email_verified_at: Timestamp | null;
  email_notified_at: Timestamp | null;
  created_at: Generated<Timestamp | null>;
  updated_at: Generated<Timestamp | null>;
  deleted: Generated<boolean | null>;
  admin: Generated<boolean | null>;
}

export interface DB {
  accounts: Accounts;
  email_folders: EmailFolders;
  emails: Emails;
  folders: Folders;
  password_resets: PasswordResets;
  providers: Providers;
  user_invitations: UserInvitations;
  users: Users;
}
