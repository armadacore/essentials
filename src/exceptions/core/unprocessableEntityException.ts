import { HttpStatusException } from './httpStatusException';

export class UnprocessableEntityException extends HttpStatusException {
	static readonly httpStatus = 422;

	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Unprocessable Entity', options);
		this.name = 'UnprocessableEntityException';
		this.setInfo('UNPROCESSABLE_ENTITY');

		Object.setPrototypeOf(this, UnprocessableEntityException.prototype);
	}
}
