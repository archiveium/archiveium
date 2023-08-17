import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Int8 = ColumnType<string, string | number | bigint, string | number | bigint>;

export type Json = ColumnType<JsonValue, string, string>;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | null | number | string;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

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

export interface Emails {
  id: Generated<Int8>;
  user_id: Int8;
  folder_id: Int8;
  message_number: number;
  udate: Timestamp;
  has_attachments: boolean;
  imported: boolean;
  import_fail_reason: string | null;
  created_at: Generated<Timestamp | null>;
  updated_at: Generated<Timestamp | null>;
}

export interface Folders {
  id: Generated<Int8>;
  user_id: Int8;
  account_id: Int8;
  name: string;
  status_uidvalidity: number;
  status_messages: number;
  last_updated_msgno: number | null;
  syncing: Generated<boolean | null>;
  deleted: Generated<boolean | null>;
  deleted_remote: Generated<boolean | null>;
  created_at: Generated<Timestamp | null>;
  updated_at: Generated<Timestamp | null>;
}

export interface Jobs {
  id: Generated<Int8>;
  queue: string;
  payload: Json;
  attempts: number;
  reserved_at: number | null;
  available_at: number;
  created_at: number;
}

export interface PasswordResets {
  id: Generated<Int8>;
  email: string;
  password_reset_token: string;
  email_notified_at: Timestamp | null;
  created_at: Generated<Timestamp | null>;
}

export interface Pgmigrations {
  id: Generated<number>;
  name: string;
  run_on: Timestamp;
}

export interface Providers {
  id: Generated<Int8>;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  is_default: boolean;
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
}

export interface DB {
  accounts: Accounts;
  emails: Emails;
  folders: Folders;
  jobs: Jobs;
  password_resets: PasswordResets;
  pgmigrations: Pgmigrations;
  providers: Providers;
  user_invitations: UserInvitations;
  users: Users;
}
