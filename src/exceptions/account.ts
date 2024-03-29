export class AccountExistsException extends Error {
	constructor(message: string) {
		super(message);

		// assign the error class name in your custom error (as a shortcut)
		this.name = this.constructor.name;

		// capturing the stack trace keeps the reference to your error class
		Error.captureStackTrace(this, this.constructor);
	}
}

export class AccountNotFoundException extends Error {
	constructor(message: string) {
		super(message);

		// assign the error class name in your custom error (as a shortcut)
		this.name = this.constructor.name;

		// capturing the stack trace keeps the reference to your error class
		Error.captureStackTrace(this, this.constructor);
	}
}

export class AccountDeletedException extends Error {
	constructor(message: string) {
		super(message);

		// assign the error class name in your custom error (as a shortcut)
		this.name = this.constructor.name;

		// capturing the stack trace keeps the reference to your error class
		Error.captureStackTrace(this, this.constructor);
	}
}

export class AccountSyncingPausedException extends Error {
	constructor(message: string) {
		super(message);

		// assign the error class name in your custom error (as a shortcut)
		this.name = this.constructor.name;

		// capturing the stack trace keeps the reference to your error class
		Error.captureStackTrace(this, this.constructor);
	}
}
