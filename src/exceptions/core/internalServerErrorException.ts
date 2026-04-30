import { Exception } from './exception';

export class InternalServerErrorException extends Exception {
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Internal Server Error', options);
		this.name = 'InternalServerErrorException';
		this.setInfo('INTERNAL_SERVER_ERROR');

		Object.setPrototypeOf(this, InternalServerErrorException.prototype);
	}
}
