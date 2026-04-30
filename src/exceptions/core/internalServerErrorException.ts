import { HttpStatusException } from './httpStatusException';

export class InternalServerErrorException extends HttpStatusException {
	static readonly httpStatus = 500;

	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Internal Server Error', options);
		this.name = 'InternalServerErrorException';
		this.setInfo('INTERNAL_SERVER_ERROR');

		Object.setPrototypeOf(this, InternalServerErrorException.prototype);
	}
}
