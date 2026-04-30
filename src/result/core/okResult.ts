import { Exception } from 'essentials:exceptions';
import { ResultBase } from './resultBase';

export class OkResult<T> extends ResultBase<T> {
	readonly isOk = true;
	readonly isErr = false;

	constructor(public readonly value: T) {
		super();
	}

	ok(): T {
		return this.value;
	}

	err(): Exception {
		throw new Exception("The Result object isn't in an error state");
	}
}
