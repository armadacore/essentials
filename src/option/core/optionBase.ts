/* eslint-disable no-restricted-syntax, @typescript-eslint/no-restricted-types */
import { InvalidStateException } from 'essentials:exceptions';
import { type IOption } from '../models/IOption';
import { None, Some } from './option';

export abstract class OptionBase<T> implements IOption<T> {
	abstract readonly isSome: boolean;
	abstract readonly isNone: boolean;

	abstract getValue(): T | undefined;

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
		// eslint-disable-next-line no-null/no-null
		return this.isSome ? (this.getValue() as T) : null;
	}

	expect(message: string): T {
		if (this.isSome) return this.getValue() as T;
		throw new InvalidStateException(message);
	}

	map<U>(fn: (value: T) => U): IOption<U> {
		return this.isSome ? Some(fn(this.getValue() as T)) : None();
	}

	mapOr<U>(defaultValue: U, fn: (value: T) => U): U {
		return this.isSome ? fn(this.getValue() as T) : defaultValue;
	}

	mapOrElse<U>(defaultFn: () => U, fn: (value: T) => U): U {
		return this.isSome ? fn(this.getValue() as T) : defaultFn();
	}

	and<U>(other: IOption<U>): IOption<U> {
		return this.isSome ? other : None();
	}

	andThen<U>(fn: (value: T) => IOption<U>): IOption<U> {
		return this.isSome ? fn(this.getValue() as T) : None();
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
		return this.isSome && predicate(this.getValue() as T) ? this : None();
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
