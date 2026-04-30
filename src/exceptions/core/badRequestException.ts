import { HttpStatusExceptionBase } from './httpStatusExceptionBase';

/** Represents an HTTP `400 Bad Request` error. */
export class BadRequestException extends HttpStatusExceptionBase {
	/** HTTP status code carried by every instance: `400`. */
	static readonly httpStatus = 400;

	/** Defaults `message` to `'Bad Request'` and tags `info` as `'BAD_REQUEST'`. */
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Bad Request', options);
		this.name = 'BadRequestException';
		this.setInfo('BAD_REQUEST');

		Object.setPrototypeOf(this, BadRequestException.prototype);
	}
}
