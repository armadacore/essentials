import { HttpStatusException } from './httpStatusException';

export class ForbiddenException extends HttpStatusException {
	static readonly httpStatus = 403;

	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Forbidden', options);
		this.name = 'ForbiddenException';
		this.setInfo('FORBIDDEN');

		Object.setPrototypeOf(this, ForbiddenException.prototype);
	}
}
