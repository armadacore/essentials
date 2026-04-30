import { HttpStatusException } from './httpStatusException';

export class MethodNotAllowedException extends HttpStatusException {
	static readonly httpStatus = 405;

	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Method Not Allowed', options);
		this.name = 'MethodNotAllowedException';
		this.setInfo('METHOD_NOT_ALLOWED');

		Object.setPrototypeOf(this, MethodNotAllowedException.prototype);
	}
}
