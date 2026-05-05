import { Exception, InvalidStateException } from 'essentials:exceptions';
import { type IResult } from '../models/IResult';

/**
 * Internal late-binding bridge that lets {@link ResultBase} call back
 * into the {@link Ok} / {@link Err} factories without a top-level
 * `import { Ok, Err } from './result'`. The latter would create a
 * module-init cycle (result → resultBase → result) that crashes
 * whenever the barrel is loaded with `isResult` (or any other
 * value-import on `ResultBase`) in the wrong order.
 *
 * `result.ts` populates these slots immediately after defining its
 * factories. Methods on `ResultBase` only read the slots at call time,
 * never at module-init time.
 */
export const resultFactories: {
	ok: <U>(value: U) => IResult<U>;
	err: <U>(error: Exception) => IResult<U>;
} = {
	ok: () => {
		throw new InvalidStateException('resultFactories.ok accessed before initialisation');
	},
	err: () => {
		throw new InvalidStateException('resultFactories.err accessed before initialisation');
	},
};

export abstract class ResultBase<T> implements IResult<T> {
	abstract readonly isOk: boolean;
	abstract readonly isErr: boolean;

	abstract ok(): T;
	abstract err(): Exception;

	map<U>(fn: (value: T) => U): IResult<U> {
		return this.isOk ? resultFactories.ok(fn(this.ok() as T)) : resultFactories.err(this.err() as Exception);
	}

	mapErr(fn: (error: Exception) => Exception): IResult<T> {
		return this.isErr ? resultFactories.err(fn(this.err() as Exception)) : resultFactories.ok(this.ok() as T);
	}

	and<U>(res: IResult<U>): IResult<U> {
		return this.isOk ? res : resultFactories.err(this.err() as Exception);
	}

	andThen<U>(fn: (value: T) => IResult<U>): IResult<U> {
		return this.isOk ? fn(this.ok() as T) : resultFactories.err(this.err() as Exception);
	}

	or(res: IResult<T>): IResult<T> {
		return this.isOk ? this : res;
	}

	orElse(fn: (error: Exception) => IResult<T>): IResult<T> {
		return this.isErr ? fn(this.err() as Exception) : resultFactories.ok(this.ok() as T);
	}

	unwrap(): T {
		if (this.isOk) return this.ok() as T;
		throw new InvalidStateException('Called unwrap on an Err value', { cause: this.err() });
	}

	unwrapOr(defaultValue: T): T {
		return this.isOk ? (this.ok() as T) : defaultValue;
	}

	unwrapOrElse(fn: (error: Exception) => T): T {
		return this.isOk ? (this.ok() as T) : fn(this.err() as Exception);
	}

	expect(message: string): T {
		if (this.isOk) return this.ok() as T;
		throw new InvalidStateException(message, { cause: this.err() });
	}

	expectErr(message: string): Exception {
		if (this.isErr) return this.err() as Exception;
		throw new InvalidStateException(message, { cause: this.ok() });
	}

	onOk(fn: (value: T) => void): void {
		if (this.isOk) fn(this.ok() as T);
	}

	onErr(fn: (error: Exception) => void): void {
		if (this.isErr) fn(this.err() as Exception);
	}

	ignoreErr(): void {}

	match<U>(onOk: (value: T) => U, onErr: (error: Exception) => U): U {
		return this.isOk ? onOk(this.ok() as T) : onErr(this.err() as Exception);
	}
}
