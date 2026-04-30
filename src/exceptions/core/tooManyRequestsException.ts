import { HttpStatusExceptionBase } from './httpStatusExceptionBase';

/** Represents an HTTP `429 Too Many Requests` error. */
export class TooManyRequestsException extends HttpStatusExceptionBase {
	/** HTTP status code carried by every instance: `429`. */
	static readonly httpStatus = 429;

	/** Defaults `message` to `'Too Many Requests'` and tags `info` as `'TOO_MANY_REQUESTS'`. */
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Too Many Requests', options);
		this.name = 'TooManyRequestsException';
		this.setInfo('TOO_MANY_REQUESTS');

		Object.setPrototypeOf(this, TooManyRequestsException.prototype);
	}
}
