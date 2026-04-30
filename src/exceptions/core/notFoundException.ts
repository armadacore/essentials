import { HttpStatusExceptionBase } from './httpStatusExceptionBase';

export class NotFoundException extends HttpStatusExceptionBase {
	static readonly httpStatus = 404;

	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Not Found', options);
		this.name = 'NotFoundException';
		this.setInfo('NOT_FOUND');

		Object.setPrototypeOf(this, NotFoundException.prototype);
	}
}
