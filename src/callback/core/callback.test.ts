/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-undefined */
import { describe, expect, it, vi } from 'vitest';
import { Callback } from './callback';

/**
 * Tests document the CURRENT (as-is) behaviour of {@link Callback}.
 *
 * Pinned quirks worth noting (see ANALYSIS.md):
 *
 *  - F-08: {@link Callback.executeOr} invokes the fallback WITHOUT
 *          forwarding the spread args. Demonstrated below.
 *  - The `if (!this._callback)` short-circuit in {@link Callback.execute}
 *          / {@link Callback.executeOr} / {@link Callback.handover} is
 *          effectively dead code: {@link Callback.none} installs a
 *          truthy noop function, so `_callback` is never falsy. The
 *          asserted contract therefore goes through the real callback
 *          (returning undefined for the noop) rather than through the
 *          guard.
 */
describe('Callback (as-is behaviour)', () => {
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

		it('execute returns undefined (the noop\u2019s implicit return)', () => {
			expect(Callback.none<() => number>().execute()).toBeUndefined();
		});

		it('handover returns a callable noop (not the dead-code fallback)', () => {
			// `_callback` is the truthy noop from `Callback.none()`, so the
			// `if (!this._callback)` branch in handover() is never taken.
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

	describe('executeOr (F-08 pinned)', () => {
		it('runs the wrapped callback when it exists, with all args forwarded', () => {
			const fn = vi.fn((a: number, b: number) => a + b);
			const fallback = vi.fn(() => 0);

			const out = Callback.create(fn).executeOr(fallback as unknown as typeof fn, 2, 3);

			expect(out).toBe(5);
			expect(fn).toHaveBeenCalledWith(2, 3);
			expect(fallback).not.toHaveBeenCalled();
		});

		it('does NOT trigger the fallback for Callback.none() either, because _callback is the truthy noop', () => {
			const fallback = vi.fn(() => 99);

			// `_callback` is the noop from Callback.none(), so the guard
			// `if (!this._callback)` is false and the noop runs (returning
			// undefined). The fallback is never invoked.
			const cb = Callback.none<() => number>();
			const out = cb.executeOr(fallback);

			expect(out).toBeUndefined();
			expect(fallback).not.toHaveBeenCalled();
		});
	});

	describe('execute when no callback exists', () => {
		it('runs the noop and returns undefined for Callback.none', () => {
			expect(Callback.none<() => number>().execute()).toBeUndefined();
		});
	});
});
