import { HttpStatusExceptionBase } from './httpStatusExceptionBase';

export class UnauthorizedException extends HttpStatusExceptionBase {
	static readonly httpStatus = 401;

	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Unauthorized', options);
		this.name = 'UnauthorizedException';
		this.setInfo('UNAUTHORIZED');

		Object.setPrototypeOf(this, UnauthorizedException.prototype);
	}
}
