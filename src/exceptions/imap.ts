export class IMAPAuthenticationFailed extends Error {
	constructor(message: string) {
		super(message);

		// assign the error class name in your custom error (as a shortcut)
		this.name = this.constructor.name;

		// capturing the stack trace keeps the reference to your error class
		Error.captureStackTrace(this, this.constructor);
	}
}

export class IMAPUidValidityChanged extends Error {
	constructor(message: string) {
		super(message);

		// assign the error class name in your custom error (as a shortcut)
		this.name = this.constructor.name;

		// capturing the stack trace keeps the reference to your error class
		Error.captureStackTrace(this, this.constructor);
	}
}

export class IMAPTooManyRequests extends Error {
	constructor(message: string) {
		super(message);

		// assign the error class name in your custom error (as a shortcut)
		this.name = this.constructor.name;

		// capturing the stack trace keeps the reference to your error class
		Error.captureStackTrace(this, this.constructor);
	}
}

export class IMAPGenericException extends Error {
	constructor(message: string) {
		super(message);

		// assign the error class name in your custom error (as a shortcut)
		this.name = this.constructor.name;

		// capturing the stack trace keeps the reference to your error class
		Error.captureStackTrace(this, this.constructor);
	}
}

export class IMAPUserAuthenticatedNotConnected extends Error {
	constructor(message: string) {
		super(message);

		// assign the error class name in your custom error (as a shortcut)
		this.name = this.constructor.name;

		// capturing the stack trace keeps the reference to your error class
		Error.captureStackTrace(this, this.constructor);
	}
}
