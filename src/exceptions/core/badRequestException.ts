import { HttpStatusException } from './httpStatusException';

export class BadRequestException extends HttpStatusException {
	static readonly httpStatus = 400;

	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Bad Request', options);
		this.name = 'BadRequestException';
		this.setInfo('BAD_REQUEST');

		Object.setPrototypeOf(this, BadRequestException.prototype);
	}
}
