import { Exception } from 'essentials:exceptions';

export interface IResult<T> {
	readonly isOk: boolean;
	readonly isErr: boolean;

	ok(): T;
	err(): Exception;

	map<U>(fn: (value: T) => U): IResult<U>;
	mapErr(fn: (error: Exception) => Exception): IResult<T>;

	and<U>(res: IResult<U>): IResult<U>;
	andThen<U>(fn: (value: T) => IResult<U>): IResult<U>;

	or(res: IResult<T>): IResult<T>;
	orElse(fn: (error: Exception) => IResult<T>): IResult<T>;

	unwrap(): T;
	unwrapOr(defaultValue: T): T;
	unwrapOrElse(fn: (error: Exception) => T): T;

	expect(message: string): T;
	expectErr(message: string): Exception;

	onOk(fn: (value: T) => void): void;
	onErr(fn: (error: Exception) => void): void;

	match<U>(onOk: (value: T) => U, onErr: (error: Exception) => U): U;
}
