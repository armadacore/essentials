import { Exception } from './exception';

export class ServiceUnavailableException extends Exception {
	constructor(message?: string, options?: {cause?: unknown}) {
		super(message || 'Service Unavailable', options);
		this.name = 'ServiceUnavailableException';
		this.setInfo('SERVICE_UNAVAILABLE');

		Object.setPrototypeOf(this, ServiceUnavailableException.prototype);
	}
}
