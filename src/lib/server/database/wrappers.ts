import type { Insertable, Updateable } from "kysely";
import type { EmailFolders, Emails, Folders } from "./types";

export type FolderUpdate = Updateable<Folders>;
export type EmailInsert = Insertable<Emails>;
export type EmailFolderInsert = Insertable<EmailFolders>;