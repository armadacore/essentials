import { HttpStatusExceptionBase } from './httpStatusExceptionBase';

export class ForbiddenException extends HttpStatusExceptionBase {
	static readonly httpStatus = 403;

	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Forbidden', options);
		this.name = 'ForbiddenException';
		this.setInfo('FORBIDDEN');

		Object.setPrototypeOf(this, ForbiddenException.prototype);
	}
}
