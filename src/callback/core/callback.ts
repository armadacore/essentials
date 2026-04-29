/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-restricted-types */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Option } from 'essentials:option';
import type { ICallback } from '../models/ICallback';

/**
 * A "fire and forget" wrapper around an optional side-effect function.
 *
 * The whole point of {@link Callback} is to let calling code invoke
 * `execute()` unconditionally without first checking whether a function
 * is registered. If one is registered, it runs. If not, a no-op runs.
 * Either way, {@link Callback.execute} returns `void | Promise<void>`
 * and is contractually side-effect-only \u2014 it does not surface a
 * meaningful return value, and it never throws to signal "no callback".
 *
 * The generic is constrained to `(...args) => void | Promise<void>` to
 * make the side-effect-only contract visible in the type system.
 */
export class Callback<T extends (...args: any[]) => void | Promise<void>> implements ICallback<T> {
	private readonly _callback: T;
	private readonly _hasCallback: boolean;

	private constructor(callback: T, hasCallback: boolean) {
		this._callback = callback;
		this._hasCallback = hasCallback;
	}

	public static create<T extends (...args: any[]) => void | Promise<void>>(callback: T): Callback<T> {
		return new Callback(callback, true);
	}

	public static none<T extends (...args: any[]) => void | Promise<void>>(): Callback<T> {
		const noop = (() => {
			// Noop \u2014 returns undefined for any sync callback type.
		}) as T;

		return new Callback(noop, false);
	}

	public static from<T extends (...args: any[]) => void | Promise<void>>(callback: T | undefined): Callback<T> {
		return Option.from(callback).match(
			(cb) => Callback.create(cb),
			() => Callback.none(),
		);
	}

	public exists(): boolean {
		return this._hasCallback;
	}

	public execute(...args: Parameters<T>): void | Promise<void> {
		return this._callback(...args);
	}

	public executeOr(orExecute: T, ...args: Parameters<T>): void | Promise<void> {
		if (!this._hasCallback) return orExecute(...args);

		return this._callback(...args);
	}

	public handover(): T {
		return this._callback;
	}
}
