import { HttpStatusException } from './httpStatusException';

export class TooManyRequestsException extends HttpStatusException {
	static readonly httpStatus = 429;

	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Too Many Requests', options);
		this.name = 'TooManyRequestsException';
		this.setInfo('TOO_MANY_REQUESTS');

		Object.setPrototypeOf(this, TooManyRequestsException.prototype);
	}
}
