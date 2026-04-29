import { Exception } from './exception';

export class ForbiddenException extends Exception {
	constructor(message?: string, options?: {cause?: unknown}) {
		super(message || 'Forbidden', options);
		this.name = 'ForbiddenException';
		this.setInfo('FORBIDDEN');

		Object.setPrototypeOf(this, ForbiddenException.prototype);
	}
}
