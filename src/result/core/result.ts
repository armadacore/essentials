import { Exception } from 'essentials:exceptions';
import { type IResult } from '../models/IResult';
import { ErrResult } from './errResult';
import { OkResult } from './okResult';

export const Ok = <T>(value: T): IResult<T> => {
	return new OkResult(value);
};

export const Err = <T = never>(error: Exception): IResult<T> => {
	return new ErrResult(error);
};

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
		return fn()
			.then(Ok)
			.catch((error) => {
				const exception =
					error instanceof Exception
						? error
						: Exception.fromError(error instanceof Error ? error : new Error(String(error)));

				return Err(exception);
			});
	},
};
