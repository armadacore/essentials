import { InvalidStateException } from 'essentials:exceptions';
import { type IOption } from '../models/IOption';

/**
 * Internal late-binding bridge that lets {@link OptionBase} call back
 * into the {@link Some} / {@link None} factories without a top-level
 * `import { Some, None } from './option'`. The latter would create a
 * module-init cycle (option → optionBase → option) that crashes
 * whenever the barrel is loaded with `isOption` (or any other
 * value-import on `OptionBase`) in the wrong order.
 *
 * `option.ts` populates these slots immediately after defining its
 * factories. Methods on `OptionBase` only read the slots at call time,
 * never at module-init time.
 */
export const optionFactories: {
	some: <U>(value: U) => IOption<U>;
	none: <U>() => IOption<U>;
} = {
	some: () => {
		throw new InvalidStateException('optionFactories.some accessed before initialisation');
	},
	none: () => {
		throw new InvalidStateException('optionFactories.none accessed before initialisation');
	},
};

export abstract class OptionBase<T> implements IOption<T> {
	abstract readonly isSome: boolean;
	abstract readonly isNone: boolean;

	protected abstract getValue(): T | undefined;

	unwrap(): T {
		if (this.isSome) return this.getValue() as T;
		throw new InvalidStateException('Called unwrap on a None value');
	}

	unwrapOr(defaultValue: T): T {
		return this.isSome ? (this.getValue() as T) : defaultValue;
	}

	unwrapOrElse(fn: () => T): T {
		return this.isSome ? (this.getValue() as T) : fn();
	}

	unwrapOrUndefined(): T | undefined {
		return this.getValue();
	}

	unwrapOrNull(): T | null {
		return this.isSome ? (this.getValue() as T) : null;
	}

	expect(message: string): T {
		if (this.isSome) return this.getValue() as T;
		throw new InvalidStateException(message);
	}

	map<U>(fn: (value: T) => U): IOption<U> {
		return this.isSome ? optionFactories.some(fn(this.getValue() as T)) : optionFactories.none();
	}

	mapOr<U>(defaultValue: U, fn: (value: T) => U): U {
		return this.isSome ? fn(this.getValue() as T) : defaultValue;
	}

	mapOrElse<U>(defaultFn: () => U, fn: (value: T) => U): U {
		return this.isSome ? fn(this.getValue() as T) : defaultFn();
	}

	and<U>(other: IOption<U>): IOption<U> {
		return this.isSome ? other : optionFactories.none();
	}

	andThen<U>(fn: (value: T) => IOption<U>): IOption<U> {
		return this.isSome ? fn(this.getValue() as T) : optionFactories.none();
	}

	onSome(fn: (value: T) => void): void {
		if (this.isSome) fn(this.getValue() as T);
	}

	onNone(fn: () => void): void {
		if (this.isNone) fn();
	}

	or(other: IOption<T>): IOption<T> {
		return this.isSome ? this : other;
	}

	orElse(fn: () => IOption<T>): IOption<T> {
		return this.isSome ? this : fn();
	}

	filter(predicate: (value: T) => boolean): IOption<T> {
		return this.isSome && predicate(this.getValue() as T) ? this : optionFactories.none();
	}

	match<U>(onSome: (value: T) => U, onNone: () => U): U {
		return this.isSome ? onSome(this.getValue() as T) : onNone();
	}

	toArray(): T[] {
		return this.isSome ? [this.getValue() as T] : [];
	}

	toString(): string {
		return this.isSome ? `Some(${String(this.getValue())})` : 'None';
	}
}
