import { HttpStatusExceptionBase } from './httpStatusExceptionBase';

/** Represents an HTTP `405 Method Not Allowed` error. */
export class MethodNotAllowedException extends HttpStatusExceptionBase {
	/** HTTP status code carried by every instance: `405`. */
	static readonly httpStatus = 405;

	/** Defaults `message` to `'Method Not Allowed'` and tags `info` as `'METHOD_NOT_ALLOWED'`. */
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Method Not Allowed', options);
		this.name = 'MethodNotAllowedException';
		this.setInfo('METHOD_NOT_ALLOWED');

		Object.setPrototypeOf(this, MethodNotAllowedException.prototype);
	}
}
