import { HttpStatusException } from './httpStatusException';

export class ConflictException extends HttpStatusException {
	static readonly httpStatus = 409;

	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Conflict', options);
		this.name = 'ConflictException';
		this.setInfo('CONFLICT');

		Object.setPrototypeOf(this, ConflictException.prototype);
	}
}
