export const load = ({ locals }) => {
	return {
		sessionId: locals.sessionId,
		user: locals.user,
		flashMessage: locals.flashMessage
	};
};
