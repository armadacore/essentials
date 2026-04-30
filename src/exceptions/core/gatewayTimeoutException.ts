import { HttpStatusExceptionBase } from './httpStatusExceptionBase';

export class GatewayTimeoutException extends HttpStatusExceptionBase {
	static readonly httpStatus = 504;

	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Gateway Timeout', options);
		this.name = 'GatewayTimeoutException';
		this.setInfo('GATEWAY_TIMEOUT');

		Object.setPrototypeOf(this, GatewayTimeoutException.prototype);
	}
}
