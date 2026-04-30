import { HttpStatusExceptionBase } from './httpStatusExceptionBase';

export class UnprocessableEntityException extends HttpStatusExceptionBase {
	static readonly httpStatus = 422;

	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Unprocessable Entity', options);
		this.name = 'UnprocessableEntityException';
		this.setInfo('UNPROCESSABLE_ENTITY');

		Object.setPrototypeOf(this, UnprocessableEntityException.prototype);
	}
}
