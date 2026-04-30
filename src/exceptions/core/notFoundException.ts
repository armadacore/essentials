import { HttpStatusExceptionBase } from './httpStatusExceptionBase';

/** Represents an HTTP `404 Not Found` error. */
export class NotFoundException extends HttpStatusExceptionBase {
	/** HTTP status code carried by every instance: `404`. */
	static readonly httpStatus = 404;

	/** Defaults `message` to `'Not Found'` and tags `info` as `'NOT_FOUND'`. */
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Not Found', options);
		this.name = 'NotFoundException';
		this.setInfo('NOT_FOUND');

		Object.setPrototypeOf(this, NotFoundException.prototype);
	}
}
