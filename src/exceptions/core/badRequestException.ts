import { Exception } from './exception';

export class BadRequestException extends Exception {
	constructor(message?: string, options?: {cause?: unknown}) {
		super(message, options);
		this.name = 'BadRequestException';
		this.setInfo('BAD_REQUEST');

		Object.setPrototypeOf(this, BadRequestException.prototype);
	}
}
