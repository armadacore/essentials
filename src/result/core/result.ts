import { Exception, InvalidStateException } from 'essentials:exceptions';
import { type IOption } from 'essentials:option';
import { type IResult } from '../models/IResult';
import { type SerializedResult } from '../models/SerializedResult';
import { ErrResult } from './errResult';
import { OkResult } from './okResult';
import { resultFactories } from './resultBase';

/**
 * Constructs an {@link Ok} variant of {@link IResult} carrying the
 * success `value`. Accepts any value, including `null` / `undefined`
 * — those are valid success payloads, distinct from {@link Err}.
 */
export const Ok = <T>(value: T): IResult<T> => {
	return new OkResult(value);
};

/**
 * Constructs an {@link Err} variant of {@link IResult} carrying
 * `error`. The error type is fixed to {@link Exception} library-wide;
 * use {@link Exception.fromError} to convert a foreign `Error`.
 */
export const Err = <T = never>(error: Exception): IResult<T> => {
	return new ErrResult(error);
};

// Wire the late-binding bridge so ResultBase methods (`map`, `mapErr`,
// `andThen`, `and`, `orElse`) can construct fresh Result values without
// a top-level import on this module. See the docstring of
// `resultFactories` in resultBase.ts.
resultFactories.ok = Ok;
resultFactories.err = Err;

/**
 * Lossless wire-format conversion: turn an {@link IResult} into its
 * {@link SerializedResult} envelope. The result is plain data and
 * survives `JSON.stringify` / `JSON.parse` round-trips intact.
 *
 * The error branch delegates to {@link Exception.serialize}, so any
 * library-known {@link Exception} subclass round-trips with its
 * concrete identity preserved (see the registry in
 * `exceptions/core/exceptionRegistry.ts`).
 *
 * Only operates on a single Result — does not walk into nested
 * objects / arrays. Callers that need deep serialisation are expected
 * to map over their data structure themselves and call `serialize`
 * per leaf.
 */
const serialize = <T>(result: IResult<T>): SerializedResult<T> => {
	return result.match<SerializedResult<T>>(
		(value) => ({ isOk: true, value }),
		(error) => ({ isOk: false, error: Exception.serialize(error) }),
	);
};

/**
 * Inverse of {@link serialize}. Reconstructs an {@link IResult} from
 * its {@link SerializedResult} envelope. Round-trip property:
 *
 *     deserialize(serialize(res))  ≡  res    (structurally)
 *
 * The error branch delegates to {@link Exception.deserialize}, so the
 * concrete subclass is restored when known to the registry, otherwise
 * a plain {@link Exception} is produced (with `info` preserved from
 * the envelope).
 *
 * Only handles the documented envelope shape; throws an
 * {@link InvalidStateException} on anything else. JSON parsing,
 * walking arrays / objects, or guessing about foreign data is
 * deliberately out of scope.
 */
const deserialize = <T>(envelope: SerializedResult<T>): IResult<T> => {
	if (envelope.isOk) return Ok(envelope.value);
	if (envelope.isOk === false) return Err(Exception.deserialize(envelope.error));

	throw new InvalidStateException('deserialize received a value that is not a SerializedResult envelope');
};

/**
 * Namespace bundling all {@link IResult}-related factories and
 * conversions. Prefer this over the top-level {@link Ok} / {@link Err}
 * factories when you want a single import surface
 * (`import { Result } from 'essentials:result'`).
 */
export const Result = {
	/** Alias for the top-level {@link Ok} factory. */
	ok: Ok,

	/** Alias for the top-level {@link Err} factory. */
	err: Err,

	serialize,
	deserialize,

	/**
	 * Runs `fn` and lifts the outcome into an {@link IResult}: the
	 * return value becomes {@link Ok}, any thrown value becomes
	 * {@link Err}. Non-{@link Exception} throws are wrapped via
	 * {@link Exception.fromError}; non-`Error` throws (e.g. a thrown
	 * string or number) are first wrapped in a synthetic `Error`.
	 */
	from: <T>(fn: () => T): IResult<T> => {
		try {
			return Ok(fn());
		} catch (error) {
			const exception =
				error instanceof Exception
					? error
					: Exception.fromError(error instanceof Error ? error : new Error(String(error)));

			return Err(exception);
		}
	},

	/**
	 * Async counterpart to {@link from}. Awaits `fn()` and lifts the
	 * outcome into a `Promise<IResult<T>>`. The same exception
	 * normalisation rules apply.
	 */
	fromAsync: async <T>(fn: () => Promise<T>): Promise<IResult<T>> => {
		try {
			return Ok(await fn());
		} catch (error) {
			const exception =
				error instanceof Exception
					? error
					: Exception.fromError(error instanceof Error ? error : new Error(String(error)));

			return Err(exception);
		}
	},

	/**
	 * Lifts an {@link IOption} into an {@link IResult} by injecting an
	 * explicit error for the missing branch. `Some(v)` becomes `Ok(v)`,
	 * `None` becomes `Err(error)`.
	 *
	 * The error must be supplied because an {@link IOption} carries no
	 * information about *why* a value is absent. Use
	 * {@link Option.fromResult} for the inverse direction (which is
	 * lossy — the error is dropped).
	 */
	fromOption: <T>(option: IOption<T>, error: Exception): IResult<T> => {
		return option.isSome ? Ok(option.unwrap()) : Err(error);
	},
};
