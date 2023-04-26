import { getAllAccountsByUserIdCount, getAllSyncingAccountsByUserIdCount } from '~/models/accounts';
import { getAllEmailsCountByUserId, getAllFailedEmailsCountByUserId } from '~/models/emails';
import { getRemotedEmailCountForSyncedFoldersByUserId } from '~/models/folders';
import { getUserById } from '~/models/users';
import type { NavbarData } from '~/types/navbar';

// TODO Save this in database
const EMAIL_QUOTA = 40000;

interface DashboardData {
    accounts: {
        added: number;
        syncing: number;
    },
    emails: {
        total: number;
        processed: number;
        failure: number;
        quota: number;
        used: string;
    }    
}

export async function buildNavbarData(userId: string): Promise<NavbarData> {
    const user = await getUserById(userId);
    return {
        user: {
            name: user.name
        }
    };
}

export async function buildDashboardData(userId: string): Promise<DashboardData> {
    const allAccountsCount = await getAllAccountsByUserIdCount(userId);
    const allSyncingAccountsCount = await getAllSyncingAccountsByUserIdCount(userId);
    const allProcessableEmailsCount = await getRemotedEmailCountForSyncedFoldersByUserId(userId);
    const allProcessedEmailsCount = await getAllEmailsCountByUserId(userId);
    const allFailedEmailsCount = await getAllFailedEmailsCountByUserId(userId);
    const usedPercentage = ((allProcessedEmailsCount / EMAIL_QUOTA ) * 100).toFixed(2);

    return {
        accounts: {
            added: allAccountsCount,
            syncing: allSyncingAccountsCount,
        },
        emails: {
            total: allProcessableEmailsCount,
            processed: allProcessedEmailsCount,
            failure: allFailedEmailsCount,
            quota: EMAIL_QUOTA,
            used: `${usedPercentage} %`,
        },
    };
}