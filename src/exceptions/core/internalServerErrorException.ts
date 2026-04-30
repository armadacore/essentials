import { HttpStatusExceptionBase } from './httpStatusExceptionBase';

/** Represents an HTTP `500 Internal Server Error`. */
export class InternalServerErrorException extends HttpStatusExceptionBase {
	/** HTTP status code carried by every instance: `500`. */
	static readonly httpStatus = 500;

	/** Defaults `message` to `'Internal Server Error'` and tags `info` as `'INTERNAL_SERVER_ERROR'`. */
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Internal Server Error', options);
		this.name = 'InternalServerErrorException';
		this.setInfo('INTERNAL_SERVER_ERROR');

		Object.setPrototypeOf(this, InternalServerErrorException.prototype);
	}
}
