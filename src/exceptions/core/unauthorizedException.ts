import { HttpStatusExceptionBase } from './httpStatusExceptionBase';

/** Represents an HTTP `401 Unauthorized` error. */
export class UnauthorizedException extends HttpStatusExceptionBase {
	/** HTTP status code carried by every instance: `401`. */
	static readonly httpStatus = 401;

	/** Defaults `message` to `'Unauthorized'` and tags `info` as `'UNAUTHORIZED'`. */
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Unauthorized', options);
		this.name = 'UnauthorizedException';
		this.setInfo('UNAUTHORIZED');

		Object.setPrototypeOf(this, UnauthorizedException.prototype);
	}
}
