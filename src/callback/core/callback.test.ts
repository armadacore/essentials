/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-undefined */
import { describe, expect, it, vi } from 'vitest';
import { Callback } from './callback';

/**
 * Tests document the "fire and forget" contract of {@link Callback}.
 *
 * The whole point of the type is to let calling code invoke
 * `execute()` unconditionally without first checking whether a function
 * is registered. The contract is therefore:
 *
 *  - {@link Callback.execute} returns `void | Promise<void>`. It does
 *    NOT surface the inner callback's return value, and it does NOT
 *    throw when no callback is registered \u2014 it runs the noop.
 *  - {@link Callback.executeOr} likewise returns `void | Promise<void>`
 *    and forwards the spread args to the fallback when none is
 *    registered.
 *  - {@link Callback.handover} returns the registered callback or the
 *    noop \u2014 either way, it is safe to invoke.
 *
 * The generic is constrained to `(...args) => void | Promise<void>` so
 * the contract is also visible in the type system.
 */
describe('Callback', () => {
	describe('Callback.create', () => {
		it('records exists() === true', () => {
			expect(Callback.create(() => undefined).exists()).toBe(true);
		});

		it('execute runs the registered callback with the spread args', () => {
			const fn = vi.fn();
			void Callback.create(fn).execute(2, 3);

			expect(fn).toHaveBeenCalledWith(2, 3);
		});

		it('execute returns void for a sync callback', () => {
			const result = Callback.create(() => undefined).execute();

			expect(result).toBeUndefined();
		});

		it('execute returns a Promise<void> for an async callback', async () => {
			const fn = vi.fn(async () => undefined);
			const result = Callback.create(fn).execute();

			expect(result).toBeInstanceOf(Promise);
			await expect(result).resolves.toBeUndefined();
			expect(fn).toHaveBeenCalledOnce();
		});

		it('handover returns the original function reference', () => {
			const fn = (): void => undefined;
			expect(Callback.create(fn).handover()).toBe(fn);
		});
	});

	describe('Callback.none', () => {
		it('records exists() === false', () => {
			expect(Callback.none().exists()).toBe(false);
		});

		it('execute is a no-op (does not throw, returns undefined)', () => {
			const result = Callback.none().execute();

			expect(result).toBeUndefined();
		});

		it('handover returns a callable noop returning undefined', () => {
			const handed = Callback.none().handover();

			expect(typeof handed).toBe('function');
			expect(handed()).toBeUndefined();
		});
	});

	describe('Callback.from', () => {
		it('returns an existing callback when fn is defined', () => {
			const fn = vi.fn();
			const cb = Callback.from(fn);

			expect(cb.exists()).toBe(true);
			void cb.execute();
			expect(fn).toHaveBeenCalledOnce();
		});

		it('returns a none callback when fn is undefined', () => {
			const cb = Callback.from<(n: number) => void>(undefined);

			expect(cb.exists()).toBe(false);
			expect(() => {
				void cb.execute(1);
			}).not.toThrow();
		});
	});

	describe('executeOr', () => {
		it('runs the wrapped callback when it exists, with all args forwarded', () => {
			const fn = vi.fn();
			const fallback = vi.fn();

			void Callback.create(fn).executeOr(fallback, 2, 3);

			expect(fn).toHaveBeenCalledWith(2, 3);
			expect(fallback).not.toHaveBeenCalled();
		});

		it('runs the fallback for Callback.none() and forwards the spread args', () => {
			const fallback = vi.fn();
			const cb = Callback.none<(a: number, b: number) => void>();

			void cb.executeOr(fallback, 4, 5);

			expect(fallback).toHaveBeenCalledWith(4, 5);
		});

		it('returns void / undefined regardless of branch', () => {
			const fallback = vi.fn();
			const out = Callback.none<(a: number, b: number) => void>().executeOr(fallback, 1, 2);

			expect(out).toBeUndefined();
		});
	});
});
