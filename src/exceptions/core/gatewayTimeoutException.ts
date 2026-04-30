import { HttpStatusException } from './httpStatusException';

export class GatewayTimeoutException extends HttpStatusException {
	static readonly httpStatus = 504;

	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Gateway Timeout', options);
		this.name = 'GatewayTimeoutException';
		this.setInfo('GATEWAY_TIMEOUT');

		Object.setPrototypeOf(this, GatewayTimeoutException.prototype);
	}
}
