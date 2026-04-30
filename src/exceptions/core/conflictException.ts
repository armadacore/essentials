import { HttpStatusExceptionBase } from './httpStatusExceptionBase';

export class ConflictException extends HttpStatusExceptionBase {
	static readonly httpStatus = 409;

	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Conflict', options);
		this.name = 'ConflictException';
		this.setInfo('CONFLICT');

		Object.setPrototypeOf(this, ConflictException.prototype);
	}
}
