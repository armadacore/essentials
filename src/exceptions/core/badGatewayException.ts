import { HttpStatusExceptionBase } from './httpStatusExceptionBase';

export class BadGatewayException extends HttpStatusExceptionBase {
	static readonly httpStatus = 502;

	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Bad Gateway', options);
		this.name = 'BadGatewayException';
		this.setInfo('BAD_GATEWAY');

		Object.setPrototypeOf(this, BadGatewayException.prototype);
	}
}
