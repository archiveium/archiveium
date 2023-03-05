import { compareSync } from 'bcrypt';
import { z } from 'zod';
import { createUser } from '~/models/users';
import { FormData } from '~/types/form';

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

export function LoginUser(credentials: FormData) {
    // console.log(credentials);
    // console.log(compareSync(credentials.password.toString(), hashedPassword));
}

export async function RegisterUser(formData: FormData) {
    const validatedData = registerFormSchema.parse(formData);
    await createUser(validatedData);
}