import { User } from "~/types/user";
import { sql } from ".";
import bcrypt from 'bcrypt';

export async function createUser(user: User): Promise<void> {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    await sql`INSERT INTO users (name, email, password)
    VALUES(${user.name}, ${user.email}, ${hashedPassword})`;
}