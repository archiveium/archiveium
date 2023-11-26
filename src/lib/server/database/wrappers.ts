import type { Insertable, Selectable, Updateable } from "kysely";
import type { DB, EmailFolders, Emails, Folders } from "./types";

type DBSelect = {
  [K in keyof DB]: Selectable<DB[K]>
}

export type FolderUpdate = Updateable<Folders>;
export type FolderInsert = Insertable<Folders>;
export type EmailInsert = Insertable<Emails>;
export type EmailFolderInsert = Insertable<EmailFolders>;

/**
 * Borrowed from https://github.com/RobinBlomberg/kysely-codegen/issues/90
 */
export type FolderSelect = DBSelect['folders'];