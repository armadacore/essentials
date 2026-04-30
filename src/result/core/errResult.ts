import { Exception } from 'essentials:exceptions';
import { ResultBase } from './resultBase';

export class ErrResult<T> extends ResultBase<T> {
	readonly isOk = false;
	readonly isErr = true;

	constructor(public readonly error: Exception) {
		super();
	}

	ok(): T {
		throw new Exception("The Result object isn't in an ok state");
	}

	err(): Exception {
		return this.error;
	}
}
