import { HttpStatusExceptionBase } from './httpStatusExceptionBase';

/** Represents an HTTP `504 Gateway Timeout` error. */
export class GatewayTimeoutException extends HttpStatusExceptionBase {
	/** HTTP status code carried by every instance: `504`. */
	static readonly httpStatus = 504;

	/** Defaults `message` to `'Gateway Timeout'` and tags `info` as `'GATEWAY_TIMEOUT'`. */
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Gateway Timeout', options);
		this.name = 'GatewayTimeoutException';
		this.setInfo('GATEWAY_TIMEOUT');

		Object.setPrototypeOf(this, GatewayTimeoutException.prototype);
	}
}
