import { HttpStatusExceptionBase } from './httpStatusExceptionBase';

/** Represents an HTTP `409 Conflict` error. */
export class ConflictException extends HttpStatusExceptionBase {
	/** HTTP status code carried by every instance: `409`. */
	static readonly httpStatus = 409;

	/** Defaults `message` to `'Conflict'` and tags `info` as `'CONFLICT'`. */
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Conflict', options);
		this.name = 'ConflictException';
		this.setInfo('CONFLICT');

		Object.setPrototypeOf(this, ConflictException.prototype);
	}
}
