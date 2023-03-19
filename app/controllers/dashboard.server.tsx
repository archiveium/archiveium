import { getAllAccountsByUserIdCount, getAllSyncingAccountsByUserIdCount } from '~/models/accounts';
import { getUserById } from '~/models/users';
import type { NavbarData } from '~/types/navbar';

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
        used: number;
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
    // const allProcessableEmailsCount = 

    return {
        accounts: {
            added: allAccountsCount,
            syncing: allSyncingAccountsCount,
        },
        emails: {
            total: 0,
            processed: 0,
            failure: 0,
            // TODO Save this in database
            quota: 40000,
            used: 0,
        },
    };
}