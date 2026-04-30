import { HttpStatusExceptionBase } from './httpStatusExceptionBase';

export class BadRequestException extends HttpStatusExceptionBase {
	static readonly httpStatus = 400;

	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Bad Request', options);
		this.name = 'BadRequestException';
		this.setInfo('BAD_REQUEST');

		Object.setPrototypeOf(this, BadRequestException.prototype);
	}
}
