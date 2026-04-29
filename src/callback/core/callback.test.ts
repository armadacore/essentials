/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-undefined */
import { describe, expect, it, vi } from 'vitest';
import { Exception } from 'essentials:exceptions';
import { Callback } from './callback';

/**
 * Tests document the behaviour of {@link Callback}.
 *
 * History note: prior to Sprint 1 this suite pinned F-08 (executeOr
 * dropped the spread args) plus the dead-code branches for the missing
 * `_callback` (the guards used `if (!this._callback)` even though
 * `Callback.none()` installed a truthy noop, so the branches were never
 * reachable). Both have been fixed and the assertions now describe the
 * corrected behaviour:
 *
 *  - The Some/None split is driven by `_hasCallback`.
 *  - {@link Callback.execute} throws when no callback is registered.
 *  - {@link Callback.executeOr} runs the fallback WITH the spread
 *    args when no callback is registered.
 *  - {@link Callback.handover} keeps returning the noop for `none()`,
 *    so callers can safely invoke the result.
 */
describe('Callback', () => {
	describe('Callback.create', () => {
		it('records exists() === true', () => {
			expect(Callback.create(() => 1).exists()).toBe(true);
		});

		it('execute returns the callback return value', () => {
			expect(Callback.create((n: number) => n * 2).execute(3)).toBe(6);
		});

		it('execute forwards the spread args verbatim', () => {
			const fn = vi.fn((a: number, b: number) => a + b);
			Callback.create(fn).execute(2, 3);
			expect(fn).toHaveBeenCalledWith(2, 3);
		});

		it('handover returns the original function reference', () => {
			const fn = (n: number): number => n + 1;
			expect(Callback.create(fn).handover()).toBe(fn);
		});
	});

	describe('Callback.none', () => {
		it('records exists() === false', () => {
			expect(Callback.none().exists()).toBe(false);
		});

		it('execute throws an Exception when no callback is registered', () => {
			expect(() => Callback.none<() => number>().execute()).toThrow(Exception);
			expect(() => Callback.none<() => number>().execute()).toThrow(
				/Called execute\(\) on a Callback without a registered function/,
			);
		});

		it('handover still returns a callable noop (returns undefined)', () => {
			const handed = Callback.none<() => number>().handover();

			expect(typeof handed).toBe('function');
			expect(handed()).toBeUndefined();
		});
	});

	describe('Callback.from', () => {
		it('returns an existing callback when fn is defined', () => {
			const fn = (n: number): number => n * 2;
			const cb = Callback.from(fn);

			expect(cb.exists()).toBe(true);
			expect(cb.execute(3)).toBe(6);
		});

		it('returns a none callback when fn is undefined', () => {
			const cb = Callback.from<(n: number) => number>(undefined);

			expect(cb.exists()).toBe(false);
		});

		it('treats the supplied fn via Option.from semantics (undefined \u2192 none)', () => {
			expect(Callback.from(undefined).exists()).toBe(false);
		});
	});

	describe('executeOr', () => {
		it('runs the wrapped callback when it exists, with all args forwarded', () => {
			const fn = vi.fn((a: number, b: number) => a + b);
			const fallback = vi.fn(() => 0);

			const out = Callback.create(fn).executeOr(fallback as unknown as typeof fn, 2, 3);

			expect(out).toBe(5);
			expect(fn).toHaveBeenCalledWith(2, 3);
			expect(fallback).not.toHaveBeenCalled();
		});

		it('runs the fallback for Callback.none() and forwards the spread args', () => {
			const fallback = vi.fn((a: number, b: number) => a + b);
			const cb = Callback.none<(a: number, b: number) => number>();

			const out = cb.executeOr(fallback, 4, 5);

			expect(out).toBe(9);
			expect(fallback).toHaveBeenCalledWith(4, 5);
		});

		it('forwards args even when the fallback ignores them (regression for F-08)', () => {
			const fallback = vi.fn(() => 99);
			const cb = Callback.none<(a: number, b: number) => number>();

			const out = cb.executeOr(fallback as unknown as (a: number, b: number) => number, 2, 3);

			expect(out).toBe(99);
			expect(fallback).toHaveBeenCalledWith(2, 3);
		});
	});
});
