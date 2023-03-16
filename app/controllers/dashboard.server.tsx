import { getUserById } from '~/models/users';

interface DashboardData {
    user: {
        name: string;
    }
}

export async function buildDashboardData(userId: string): Promise<DashboardData> {
    const user = await getUserById(userId);
    await new Promise(resolve => setTimeout(resolve, 5000));

    return {
        user: {
            name: user.name
        }
    };
}