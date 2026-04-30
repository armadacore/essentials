import { HttpStatusExceptionBase } from './httpStatusExceptionBase';

/** Represents an HTTP `403 Forbidden` error. */
export class ForbiddenException extends HttpStatusExceptionBase {
	/** HTTP status code carried by every instance: `403`. */
	static readonly httpStatus = 403;

	/** Defaults `message` to `'Forbidden'` and tags `info` as `'FORBIDDEN'`. */
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Forbidden', options);
		this.name = 'ForbiddenException';
		this.setInfo('FORBIDDEN');

		Object.setPrototypeOf(this, ForbiddenException.prototype);
	}
}
