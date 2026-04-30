import { InvalidStateException } from 'essentials:exceptions';
import type { IOption } from 'essentials:option';
import { None, Option, Some } from 'essentials:option';
import type { ICallback } from '../models/ICallback';

/**
 * A wrapper around an optional function reference.
 *
 * {@link Callback} mirrors the strict contract of {@link Option} and
 * {@link Result}: there is one set of methods that assume a callback
 * is registered (and throw if it is not) and a parallel set that
 * accept a fallback for the absent case.
 *
 *  - {@link Callback.execute} runs the registered callback and
 *    returns its result. Throws {@link InvalidStateException} when no
 *    callback is registered.
 *  - {@link Callback.executeOr} runs the registered callback or
 *    the supplied fallback and always returns a value of the
 *    callback's return type.
 *  - {@link Callback.handover} returns the registered callback.
 *    Throws {@link InvalidStateException} when no callback is registered.
 *  - {@link Callback.handoverOr} returns the registered callback
 *    or the supplied fallback.
 *  - {@link Callback.hasCallback} is the explicit pre-check, the
 *    pendant of {@link Option.isSome}.
 */
export class Callback<T extends (...args: any[]) => any> implements ICallback<T> {
	private readonly _callback: IOption<T>;

	private constructor(callback: IOption<T>) {
		this._callback = callback;
	}

	public static create<T extends (...args: any[]) => any>(callback: T): Callback<T> {
		return new Callback(Some(callback));
	}

	public static none<T extends (...args: any[]) => any>(): Callback<T> {
		return new Callback<T>(None());
	}

	public static from<T extends (...args: any[]) => any>(callback: T | undefined): Callback<T> {
		return new Callback(Option.from(callback));
	}

	public get hasCallback(): boolean {
		return this._callback.isSome;
	}

	public execute(...args: Parameters<T>): ReturnType<T> {
		if (this._callback.isNone) {
			throw new InvalidStateException('Cannot execute Callback: no callback registered');
		}

		return this._callback.unwrap()(...args) as ReturnType<T>;
	}

	public executeOr(or: T, ...args: Parameters<T>): ReturnType<T> {
		if (this._callback.isNone) {
			return or(...args) as ReturnType<T>;
		}

		return this._callback.unwrap()(...args) as ReturnType<T>;
	}

	public handover(): T {
		if (this._callback.isNone) {
			throw new InvalidStateException('Cannot handover Callback: no callback registered');
		}

		return this._callback.unwrap();
	}

	public handoverOr(or: T): T {
		if (this._callback.isNone) {
			return or;
		}

		return this._callback.unwrap();
	}
}
