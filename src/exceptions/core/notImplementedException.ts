import { HttpStatusExceptionBase } from './httpStatusExceptionBase';

/** Represents an HTTP `501 Not Implemented` error. */
export class NotImplementedException extends HttpStatusExceptionBase {
	/** HTTP status code carried by every instance: `501`. */
	static readonly httpStatus = 501;

	/** Defaults `message` to `'Not Implemented'` and tags `info` as `'NOT_IMPLEMENTED'`. */
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Not Implemented', options);
		this.name = 'NotImplementedException';
		this.setInfo('NOT_IMPLEMENTED');

		Object.setPrototypeOf(this, NotImplementedException.prototype);
	}
}
