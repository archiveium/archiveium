import type { Insertable, Selectable, Updateable } from "kysely";
import type { DB, EmailFolders, Emails, Folders, Providers } from "./types";

type DBSelect = {
  [K in keyof DB]: Selectable<DB[K]>
}

export type FolderUpdate = Updateable<Folders>;
export type FolderInsert = Insertable<Folders>;
export type EmailInsert = Insertable<Emails>;
export type EmailFolderInsert = Insertable<EmailFolders>;
export type ProviderInsert = Insertable<Providers>;

/**
 * Borrowed from https://github.com/RobinBlomberg/kysely-codegen/issues/90
 */
export type FolderSelect = DBSelect['folders'];