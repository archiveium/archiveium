export interface Account {
    id: number;
    name: string;
    username: string;
    syncing: boolean;
    deleted: boolean;
    searchable: boolean;
    created_at: Date;
    updated_at: Date;
}