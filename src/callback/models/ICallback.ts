/**
 * Public contract of {@link Callback}: an optional function reference
 * with strict (`execute` / `handover`) and lenient (`executeOr` /
 * `handoverOr`) access patterns. Mirrors the {@link IOption} /
 * {@link IResult} discipline.
 */
export interface ICallback<T extends (...args: any[]) => any> {
	/** `true` if a callback is registered, `false` otherwise. */
	get hasCallback(): boolean;

	/**
	 * Invokes the registered callback with `args` and returns its
	 * result.
	 *
	 * @throws {InvalidStateException} if no callback is registered.
	 */
	execute(...args: Parameters<T>): ReturnType<T>;

	/**
	 * Invokes the registered callback with `args`, or `or(...args)`
	 * if no callback is registered. Always returns a value of the
	 * callback's return type.
	 */
	executeOr(or: T, ...args: Parameters<T>): ReturnType<T>;

	/**
	 * Returns the registered callback function itself, allowing the
	 * caller to invoke it later or pass it on.
	 *
	 * @throws {InvalidStateException} if no callback is registered.
	 */
	handover(): T;

	/** Returns the registered callback, or `or` if none is registered. */
	handoverOr(or: T): T;
}
