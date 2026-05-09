import { Exception } from './exception';

/** Thrown when a method or feature has not been implemented yet. */
export class NotImplementedException extends Exception {
	/** Defaults `message` to `'Not Implemented'` and tags `info` as `'NOT_IMPLEMENTED'`. */
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Not Implemented', options);
		this.name = 'NotImplementedException';
		this.setInfo('NOT_IMPLEMENTED');

		Object.setPrototypeOf(this, NotImplementedException.prototype);
	}
}
