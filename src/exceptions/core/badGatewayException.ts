import { HttpStatusExceptionBase } from './httpStatusExceptionBase';

/** Represents an HTTP `502 Bad Gateway` error. */
export class BadGatewayException extends HttpStatusExceptionBase {
	/** HTTP status code carried by every instance: `502`. */
	static readonly httpStatus = 502;

	/** Defaults `message` to `'Bad Gateway'` and tags `info` as `'BAD_GATEWAY'`. */
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Bad Gateway', options);
		this.name = 'BadGatewayException';
		this.setInfo('BAD_GATEWAY');

		Object.setPrototypeOf(this, BadGatewayException.prototype);
	}
}
