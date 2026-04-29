/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-undefined, no-restricted-syntax, @typescript-eslint/no-restricted-types */
import { Exception } from 'essentials:exceptions';
import { type IOption } from '../models/IOption';
import { None, Some } from './option';

export abstract class OptionBase<T> implements IOption<T> {
	abstract readonly isSome: boolean;
	abstract readonly isNone: boolean;

	abstract getValue(): T | undefined;

	unwrap(): T {
		const value = this.getValue();
		if (value !== undefined) return value;
		throw new Exception('Called unwrap on a None value');
	}

	unwrapOr(defaultValue: T): T {
		const value = this.getValue();

		return value !== undefined ? value : defaultValue;
	}

	unwrapOrElse(fn: () => T): T {
		const value = this.getValue();

		return value !== undefined ? value : fn();
	}

	unwrapOrUndefined(): T | undefined {
		return this.getValue();
	}

	unwrapOrNull(): T | null {
		const value = this.getValue();

		// eslint-disable-next-line no-null/no-null
		return value !== undefined ? value : null;
	}

	expect(message: string): T {
		const value = this.getValue();
		if (value !== undefined) return value;
		throw new Exception(message);
	}

	map<U>(fn: (value: T) => U): IOption<U> {
		const value = this.getValue();

		return value !== undefined ? Some(fn(value)) : None();
	}

	mapOr<U>(defaultValue: U, fn: (value: T) => U): U {
		const value = this.getValue();

		return value !== undefined ? fn(value) : defaultValue;
	}

	mapOrElse<U>(defaultFn: () => U, fn: (value: T) => U): U {
		const value = this.getValue();

		return value !== undefined ? fn(value) : defaultFn();
	}

	and<U>(other: IOption<U>): IOption<U> {
		return this.isSome ? other : None();
	}

	andThen<U>(fn: (value: T) => IOption<U>): IOption<U> {
		const value = this.getValue();

		return value !== undefined ? fn(value) : None();
	}

	onSome(fn: (value: T) => void): void {
		const value = this.getValue();
		value !== undefined && fn(value);
	}

	onNone(fn: () => void): void {
		const value = this.getValue();
		value === undefined && fn();
	}

	or(other: IOption<T>): IOption<T> {
		return this.isSome ? this : other;
	}

	orElse(fn: () => IOption<T>): IOption<T> {
		return this.isSome ? this : fn();
	}

	filter(predicate: (value: T) => boolean): IOption<T> {
		const value = this.getValue();

		return value !== undefined && predicate(value) ? this : None();
	}

	match<U>(onSome: (value: T) => U, onNone: () => U): U {
		const value = this.getValue();

		return value !== undefined ? onSome(value) : onNone();
	}

	toArray(): T[] {
		const value = this.getValue();

		return value !== undefined ? [value] : [];
	}

	toString(): string {
		const value = this.getValue();

		return value !== undefined ? `Some(${value})` : 'None';
	}
}
