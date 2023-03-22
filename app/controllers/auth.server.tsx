import { z } from 'zod';
import { createUser, getUserByEmail } from '~/models/users';
import type { FormData } from '~/types/form';
import crypto from 'crypto';
import { InvalidPasswordException, UserAlreadyRegisteredException, UserNotAcceptedException } from '~/exceptions/auth';
import type { User } from '~/types/user';
import { getInvitedUser } from '~/models/userInvitations';

const registerFormSchema = z.object({
    name: z.string().trim().min(4, 'Must be of at-least 4 characters'),
    email: z.string().email('Must be a valid email address'),
    password: z.string().trim().min(8, 'Must be of at-least 8 characters'),
    passwordConfirm: z.string().trim(),
})
.refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: [ 'passwordConfirm' ]
});
const loginFormSchema = z.object({
    email: z.string().trim().email('Must be a valid email address'),
    password: z.string().trim().min(8, 'Must be of at-least 8 characters'),
});

function verifyUserPassword(hashedPassword: string, password: string) {
    const [salt, key] = hashedPassword.split(":");
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const isValid = crypto.timingSafeEqual(keyBuffer, derivedKey);

    if (!isValid) {
        throw new InvalidPasswordException('Invalid password');
    }
}

export async function LoginUser(credentials: FormData): Promise<User> {
    const validatedData = loginFormSchema.parse(credentials);
    const user = await getUserByEmail(validatedData.email);
    verifyUserPassword(user.password, validatedData.password);
    return user;
}

export async function RegisterUser(formData: FormData) {
    const validatedData = registerFormSchema.parse(formData);
    const invitedUser = await getInvitedUser(validatedData.email);
    if (!invitedUser.accepted) {
        throw new UserNotAcceptedException(`${validatedData.email} has not been chosen for registration yet.`);
    } else if (invitedUser.notification_sent_at) {
        throw new UserAlreadyRegisteredException(`${validatedData.email} has already been registered. Please check inbox.`);
    }
    await createUser(validatedData);
}