import { Exception } from './exception';

export class ConflictException extends Exception {
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Conflict', options);
		this.name = 'ConflictException';
		this.setInfo('CONFLICT');

		Object.setPrototypeOf(this, ConflictException.prototype);
	}
}
