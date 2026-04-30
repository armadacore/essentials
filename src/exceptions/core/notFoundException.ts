import { Exception } from './exception';

export class NotFoundException extends Exception {
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Not Found', options);
		this.name = 'NotFoundException';
		this.setInfo('NOT_FOUND');

		Object.setPrototypeOf(this, NotFoundException.prototype);
	}
}
