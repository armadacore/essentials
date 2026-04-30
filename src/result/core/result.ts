import { Exception } from 'essentials:exceptions';
import { type IOption } from 'essentials:option';
import { type IResult } from '../models/IResult';
import { ErrResult } from './errResult';
import { OkResult } from './okResult';
import { resultFactories } from './resultBase';

export const Ok = <T>(value: T): IResult<T> => {
	return new OkResult(value);
};

export const Err = <T = never>(error: Exception): IResult<T> => {
	return new ErrResult(error);
};

// Wire the late-binding bridge so ResultBase methods (`map`, `mapErr`,
// `andThen`, `and`, `orElse`) can construct fresh Result values without
// a top-level import on this module. See the docstring of
// `resultFactories` in resultBase.ts.
resultFactories.ok = Ok;
resultFactories.err = Err;

export const Result = {
	ok: Ok,
	err: Err,

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
