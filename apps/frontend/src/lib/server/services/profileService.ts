import * as profileSchema from '$lib/server/schemas/profileSchema';
import * as authService from '$lib/server/services/authService';
import * as userService from '$lib/server/services/userService';

export async function updatePassword(userId: string, data: FormData) {
	const validatedData = profileSchema.passwordUpdateFormSchema.parse({
		currentPassword: data.get('currentPassword'),
		password: data.get('password'),
		passwordConfirm: data.get('passwordConfirm')
	});

	// validate current password
	const user = await userService.findUserById(userId);
	authService.verifyUserPassword(user.password, validatedData.currentPassword);

	// save new password
	return await userService.updatePasswordByUserEmail(user.email, validatedData.password);
}
