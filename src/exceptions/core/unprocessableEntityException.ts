import { HttpStatusExceptionBase } from './httpStatusExceptionBase';

/** Represents an HTTP `422 Unprocessable Entity` error. */
export class UnprocessableEntityException extends HttpStatusExceptionBase {
	/** HTTP status code carried by every instance: `422`. */
	static readonly httpStatus = 422;

	/** Defaults `message` to `'Unprocessable Entity'` and tags `info` as `'UNPROCESSABLE_ENTITY'`. */
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Unprocessable Entity', options);
		this.name = 'UnprocessableEntityException';
		this.setInfo('UNPROCESSABLE_ENTITY');

		Object.setPrototypeOf(this, UnprocessableEntityException.prototype);
	}
}
