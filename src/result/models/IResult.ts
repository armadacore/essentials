import { Exception } from 'essentials:exceptions';

/**
 * The {@link IResult} type. Represents the outcome of a fallible
 * computation: every {@link IResult} is either {@link Ok} (success,
 * carrying a value of type `T`) or {@link Err} (failure, carrying an
 * {@link Exception}).
 *
 * The error type is fixed to {@link Exception} library-wide so error
 * handling stays uniform — callers always know what shape `err()`
 * returns. Use {@link Result.from} / {@link Result.fromAsync} to lift
 * a throwing computation, or the factories {@link Ok} / {@link Err}
 * directly when the branch is known statically. Reach for the
 * namespace {@link Result} for conversions to and from
 * {@link IOption}.
 */
export interface IResult<T> {
	/** `true` if this is an {@link Ok} variant, otherwise `false`. */
	readonly isOk: boolean;

	/** `true` if this is an {@link Err} variant, otherwise `false`. */
	readonly isErr: boolean;

	/**
	 * Returns the contained success value.
	 *
	 * @throws {InvalidStateException} if called on an {@link Err}.
	 */
	ok(): T;

	/**
	 * Returns the contained error.
	 *
	 * @throws {InvalidStateException} if called on an {@link Ok}.
	 */
	err(): Exception;

	/**
	 * Maps an `IResult<T>` to an `IResult<U>` by applying `fn` to a
	 * contained {@link Ok} value. {@link Err} is propagated unchanged.
	 */
	map<U>(fn: (value: T) => U): IResult<U>;

	/**
	 * Maps an {@link Err} by applying `fn` to its error. {@link Ok}
	 * is propagated unchanged. Useful for adding context or
	 * translating between exception types.
	 */
	mapErr(fn: (error: Exception) => Exception): IResult<T>;

	/**
	 * Returns `res` if this is {@link Ok}, otherwise the original
	 * {@link Err}. Short-circuits — `res` is not inspected on `Err`.
	 */
	and<U>(res: IResult<U>): IResult<U>;

	/**
	 * Returns `fn(value)` if {@link Ok}, otherwise the original
	 * {@link Err}. The monadic bind / `flatMap` for {@link IResult}.
	 */
	andThen<U>(fn: (value: T) => IResult<U>): IResult<U>;

	/** Returns this result if {@link Ok}, otherwise `res`. */
	or(res: IResult<T>): IResult<T>;

	/**
	 * Returns this result if {@link Ok}, otherwise the result of
	 * calling `fn` with the contained error. Use to attempt recovery.
	 */
	orElse(fn: (error: Exception) => IResult<T>): IResult<T>;

	/**
	 * Returns the contained {@link Ok} value.
	 *
	 * @throws the contained {@link Exception} if called on an {@link Err}.
	 */
	unwrap(): T;

	/** Returns the contained {@link Ok} value, otherwise `defaultValue`. */
	unwrapOr(defaultValue: T): T;

	/**
	 * Returns the contained {@link Ok} value, otherwise computes a
	 * fallback by calling `fn` with the error. `fn` is only invoked
	 * on {@link Err}.
	 */
	unwrapOrElse(fn: (error: Exception) => T): T;

	/**
	 * Returns the contained {@link Ok} value, or throws an
	 * {@link InvalidStateException} carrying `message` if called on
	 * an {@link Err}. Prefer over {@link unwrap} when you can phrase
	 * a meaningful invariant.
	 */
	expect(message: string): T;

	/**
	 * Returns the contained {@link Err} value, or throws an
	 * {@link InvalidStateException} carrying `message` if called on
	 * an {@link Ok}.
	 */
	expectErr(message: string): Exception;

	/** Calls `fn` with the contained value if this is {@link Ok}. No-op on {@link Err}. */
	onOk(fn: (value: T) => void): void;

	/** Calls `fn` with the contained error if this is {@link Err}. No-op on {@link Ok}. */
	onErr(fn: (error: Exception) => void): void;

	/**
	 * Pattern-matches on the variant. Calls `onOk(value)` for
	 * {@link Ok}, `onErr(error)` for {@link Err}, and returns the
	 * result. The total replacement for `if (res.isOk) … else …`.
	 */
	match<U>(onOk: (value: T) => U, onErr: (error: Exception) => U): U;
}
