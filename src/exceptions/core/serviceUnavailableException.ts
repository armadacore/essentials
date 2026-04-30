import { HttpStatusExceptionBase } from './httpStatusExceptionBase';

/** Represents an HTTP `503 Service Unavailable` error. */
export class ServiceUnavailableException extends HttpStatusExceptionBase {
	/** HTTP status code carried by every instance: `503`. */
	static readonly httpStatus = 503;

	/** Defaults `message` to `'Service Unavailable'` and tags `info` as `'SERVICE_UNAVAILABLE'`. */
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Service Unavailable', options);
		this.name = 'ServiceUnavailableException';
		this.setInfo('SERVICE_UNAVAILABLE');

		Object.setPrototypeOf(this, ServiceUnavailableException.prototype);
	}
}
