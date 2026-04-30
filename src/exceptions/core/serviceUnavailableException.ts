import { HttpStatusException } from './httpStatusException';

export class ServiceUnavailableException extends HttpStatusException {
	static readonly httpStatus = 503;

	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Service Unavailable', options);
		this.name = 'ServiceUnavailableException';
		this.setInfo('SERVICE_UNAVAILABLE');

		Object.setPrototypeOf(this, ServiceUnavailableException.prototype);
	}
}
