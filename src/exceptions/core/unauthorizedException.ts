import { Exception } from './exception';

export class UnauthorizedException extends Exception {
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Unauthorized', options);
		this.name = 'UnauthorizedException';
		this.setInfo('UNAUTHORIZED');

		Object.setPrototypeOf(this, UnauthorizedException.prototype);
	}
}
