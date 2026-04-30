/**
 * The {@link IOption} type. Represents an optional value: every
 * {@link IOption} is either {@link Some} (containing a value of type
 * `T`) or {@link None} (containing no value).
 *
 * Use {@link Option.from} to lift a possibly-nullish value, or the
 * factories {@link Some}/{@link None} directly when the branch is
 * known statically. Reach for the namespace {@link Option} for
 * conversions to and from {@link IResult}, predicates and
 * (de)serialisation.
 */
export interface IOption<T> {
	/** `true` if this is a {@link Some} variant, otherwise `false`. */
	readonly isSome: boolean;

	/** `true` if this is a {@link None} variant, otherwise `false`. */
	readonly isNone: boolean;

	/**
	 * Returns the contained value.
	 *
	 * @throws {InvalidStateException} if called on a {@link None}.
	 */
	unwrap(): T;

	/** Returns the contained value if {@link Some}, otherwise `defaultValue`. */
	unwrapOr(defaultValue: T): T;

	/**
	 * Returns the contained value if {@link Some}, otherwise computes
	 * a fallback by calling `fn`. `fn` is only invoked on {@link None}.
	 */
	unwrapOrElse(fn: () => T): T;

	/** Returns the contained value if {@link Some}, otherwise `undefined`. */
	unwrapOrUndefined(): T | undefined;

	/** Returns the contained value if {@link Some}, otherwise `null`. */
	unwrapOrNull(): T | null;

	/**
	 * Returns the contained value, or throws an
	 * {@link InvalidStateException} carrying `message` if called on a
	 * {@link None}. Prefer over {@link unwrap} when you can phrase
	 * a meaningful invariant.
	 */
	expect(message: string): T;

	/**
	 * Maps an `IOption<T>` to an `IOption<U>` by applying `fn` to a
	 * contained value. `None` is propagated unchanged.
	 */
	map<U>(fn: (value: T) => U): IOption<U>;

	/** Returns `fn(value)` if {@link Some}, otherwise `defaultValue`. */
	mapOr<U>(defaultValue: U, fn: (value: T) => U): U;

	/**
	 * Returns `fn(value)` if {@link Some}, otherwise the result of
	 * calling `defaultFn`. Both branches are eager only on the path
	 * actually taken.
	 */
	mapOrElse<U>(defaultFn: () => U, fn: (value: T) => U): U;

	/**
	 * Returns `other` if this is {@link Some}, otherwise {@link None}.
	 * Short-circuits — `other` is not inspected when this is `None`.
	 */
	and<U>(other: IOption<U>): IOption<U>;

	/**
	 * Returns `fn(value)` if {@link Some}, otherwise {@link None}.
	 * The monadic bind / `flatMap` for {@link IOption}.
	 */
	andThen<U>(fn: (value: T) => IOption<U>): IOption<U>;

	/** Calls `fn` with the contained value if this is {@link Some}. No-op on {@link None}. */
	onSome(fn: (value: T) => void): void;

	/** Calls `fn` if this is {@link None}. No-op on {@link Some}. */
	onNone(fn: () => void): void;

	/** Returns this option if {@link Some}, otherwise `other`. */
	or(other: IOption<T>): IOption<T>;

	/** Returns this option if {@link Some}, otherwise the result of calling `fn`. */
	orElse(fn: () => IOption<T>): IOption<T>;

	/**
	 * Returns the option unchanged if {@link Some} and `predicate`
	 * returns `true` for the contained value, otherwise {@link None}.
	 */
	filter(predicate: (value: T) => boolean): IOption<T>;

	/**
	 * Pattern-matches on the variant. Calls `onSome(value)` for
	 * {@link Some}, `onNone()` for {@link None}, and returns the
	 * result. The total replacement for `if (opt.isSome) … else …`.
	 */
	match<U>(onSome: (value: T) => U, onNone: () => U): U;

	/** Returns `[value]` if {@link Some}, otherwise `[]`. */
	toArray(): T[];

	/** Returns `"Some(value)"` or `"None"`. Intended for diagnostics. */
	toString(): string;
}
