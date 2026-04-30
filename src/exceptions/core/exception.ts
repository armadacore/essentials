import { type IException } from '../models/IException';

/**
 * Exception class that extends Error with additional info property.
 * Provides structured error handling with mandatory info context.
 * Maintains full Error compatibility while adding business context.
 */
export class Exception extends Error implements IException {
	protected _info: string = 'UNKNOWN_ERROR';

	/**
	 * Creates a new Exception instance
	 * @param {string} [message] - Error message (optional)
	 * @param {ErrorOptions} [options] - Error options for stack trace and cause (optional)
	 */
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message, options);

		this.name = 'Exception';

		// Maintain proper prototype chain for instanceof checks
		Object.setPrototypeOf(this, new.target.prototype);
	}

	/**
	 * Gets the info property value
	 * @returns {string} The info context string
	 */
	get info(): string {
		return this._info;
	}

	/**
	 * Sets the info property value (protected for inheritance)
	 * @param {string} value - The info context string
	 */
	protected setInfo(value: string): void {
		this._info = value;
	}

	/**
	 * Custom JSON serialization to include Error properties.
	 *
	 * Intentionally omits `stack` to avoid leaking implementation
	 * details / internal paths into serialised payloads (e.g. API
	 * responses, logs shipped off-host).
	 * @returns {object} Object representation for JSON serialization
	 */
	toJSON(): Record<string, unknown> {
		return {
			name: this.name,
			message: this.message,
			info: this._info,
			cause: (this as Error & { cause?: unknown }).cause,
		};
	}

	/**
	 * Creates a new Exception from an existing Error
	 * @param {Error} error - The source Error to convert
	 * @returns {Exception} A new Exception instance with preserved stack trace
	 */
	public static fromError(error: Error): Exception {
		const exception = new Exception(error.message, { cause: error });

		// Preserve original stack trace if available
		if (error.stack) {
			exception.stack = error.stack;
		}

		return exception;
	}
}
