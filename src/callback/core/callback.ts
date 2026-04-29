/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-restricted-types */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Option } from 'essentials:option';
import type { ICallback } from '../models/ICallback';

export class Callback<T extends (...args: any[]) => any> implements ICallback<T> {
	private readonly _callback: T;
	private readonly _hasCallback: boolean;

	private constructor(callback: T, hasCallback: boolean) {
		this._callback = callback;
		this._hasCallback = hasCallback;
	}

	public static create<T extends (...args: any[]) => any>(callback: T): Callback<T> {
		return new Callback(callback, true);
	}

	public static none<T extends (...args: any[]) => any>(): Callback<T> {
		const noop = (() => {
			// Noop implementation that returns undefined for any function type
		}) as T;

		return new Callback(noop, false);
	}

	public static from<T extends (...args: any[]) => any>(callback: T | undefined): Callback<T> {
		return Option.from(callback).match(
			(cb) => Callback.create(cb),
			() => Callback.none(),
		);
	}

	public exists(): boolean {
		return this._hasCallback;
	}

	public execute(...args: Parameters<T>): ReturnType<T> {
		if (!this._callback) return (() => '' as unknown)() as ReturnType<T>;

		return this._callback(...args) as ReturnType<T>;
	}

	public executeOr(orExecute: T, ...args: Parameters<T>): ReturnType<T> {
		if (!this._callback) return orExecute() as ReturnType<T>;

		return this._callback(...args) as ReturnType<T>;
	}

	public handover(): T {
		if (!this._callback) return (() => {}) as T;

		return this._callback;
	}
}
