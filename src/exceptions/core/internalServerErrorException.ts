import { HttpStatusExceptionBase } from './httpStatusExceptionBase';

export class InternalServerErrorException extends HttpStatusExceptionBase {
	static readonly httpStatus = 500;

	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Internal Server Error', options);
		this.name = 'InternalServerErrorException';
		this.setInfo('INTERNAL_SERVER_ERROR');

		Object.setPrototypeOf(this, InternalServerErrorException.prototype);
	}
}
