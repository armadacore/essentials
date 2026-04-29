import { Exception } from 'essentials:exceptions';
import { type IResult } from '../models/IResult';
import { Err, Ok } from './result';

export abstract class ResultBase<T> implements IResult<T> {
	abstract readonly isOk: boolean;
	abstract readonly isErr: boolean;

	abstract ok(): T;
	abstract err(): Exception;

	map<U>(fn: (value: T) => U): IResult<U> {
		return this.isOk ? Ok(fn(this.ok() as T)) : Err(this.err() as Exception);
	}

	mapErr(fn: (error: Exception) => Exception): IResult<T> {
		return this.isErr ? Err(fn(this.err() as Exception)) : Ok(this.ok() as T);
	}

	and<U>(res: IResult<U>): IResult<U> {
		return this.isOk ? res : Err(this.err() as Exception);
	}

	andThen<U>(fn: (value: T) => IResult<U>): IResult<U> {
		return this.isOk ? fn(this.ok() as T) : Err(this.err() as Exception);
	}

	or(res: IResult<T>): IResult<T> {
		return this.isOk ? this : res;
	}

	orElse(fn: (error: Exception) => IResult<T>): IResult<T> {
		return this.isErr ? fn(this.err() as Exception) : Ok(this.ok() as T);
	}

	unwrap(): T {
		if (this.isOk) return this.ok() as T;
		throw new Exception(`Called unwrap on an Err value: ${this.err()}`);
	}

	unwrapOr(defaultValue: T): T {
		return this.isOk ? (this.ok() as T) : defaultValue;
	}

	unwrapOrElse(fn: (error: Exception) => T): T {
		return this.isOk ? (this.ok() as T) : fn(this.err() as Exception);
	}

	expect(message: string): T {
		if (this.isOk) return this.ok() as T;
		throw new Exception(`${message}: ${this.err()}`);
	}

	expectErr(message: string): Exception {
		if (this.isErr) return this.err() as Exception;
		throw new Exception(`${message}: ${this.ok()}`);
	}

	onOk(fn: (value: T) => void): void {
		if (this.isOk) fn(this.ok() as T);
	}

	onErr(fn: (error: Exception) => void): void {
		if (this.isErr) fn(this.err() as Exception);
	}

	match<U>(onOk: (value: T) => U, onErr: (error: Exception) => U): U {
		return this.isOk ? onOk(this.ok() as T) : onErr(this.err() as Exception);
	}
}
