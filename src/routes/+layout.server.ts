export const load = ({ locals, url }) => {
	return {
		sessionId: locals.sessionId,
		user: locals.user,
		flashMessage: locals.flashMessage,
		showNavbar: locals.user && !url.pathname.startsWith('/email') // do not show navbar in email view
	};
};
