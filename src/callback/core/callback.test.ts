/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-undefined */
import { describe, expect, it, vi } from 'vitest';
import { InvalidStateException } from 'essentials:exceptions';
import { Callback } from './callback';

/**
 * Tests document the strict contract of {@link Callback}, mirroring
 * the {@link Option} / {@link Result} pattern:
 *
 *  - {@link Callback.execute} and {@link Callback.handover} throw
 *    {@link Exception} when no callback is registered.
 *  - {@link Callback.executeOr} and {@link Callback.handoverOr}
 *    accept a fallback for the absent case and never throw.
 *  - {@link Callback.hasCallback} is the explicit pre-check.
 *
 * The generic constraint is open ((...args) => any) so callbacks may
 * return data, not only void / Promise<void>.
 */
describe('Callback', () => {
	describe('Callback.create', () => {
		it('records hasCallback === true', () => {
			expect(Callback.create(() => undefined).hasCallback).toBe(true);
		});

		it('execute runs the registered callback with the spread args', () => {
			const fn = vi.fn();
			Callback.create(fn).execute(2, 3);

			expect(fn).toHaveBeenCalledWith(2, 3);
		});

		it('execute returns the callback return value', () => {
			const cb = Callback.create((a: number, b: number) => a + b);

			expect(cb.execute(2, 3)).toBe(5);
		});

		it('execute returns a Promise for an async callback', async () => {
			const fn = vi.fn(async () => 42);
			const result = Callback.create(fn).execute();

			expect(result).toBeInstanceOf(Promise);
			await expect(result).resolves.toBe(42);
		});

		it('handover returns the original function reference', () => {
			const fn = (): number => 1;
			expect(Callback.create(fn).handover()).toBe(fn);
		});

		it('handoverOr returns the registered callback, ignoring the fallback', () => {
			const fn = (): number => 1;
			const fallback = (): number => 2;

			expect(Callback.create(fn).handoverOr(fallback)).toBe(fn);
		});

		it('executeOr runs the wrapped callback when it exists, ignoring the fallback', () => {
			const fn = vi.fn((a: number, b: number): number => a + b);
			const fallback = vi.fn((): number => 0);

			expect(Callback.create(fn).executeOr(fallback, 2, 3)).toBe(5);
			expect(fn).toHaveBeenCalledWith(2, 3);
			expect(fallback).not.toHaveBeenCalled();
		});
	});

	describe('Callback.none', () => {
		it('records hasCallback === false', () => {
			expect(Callback.none().hasCallback).toBe(false);
		});

		it('execute throws InvalidStateException with a descriptive message', () => {
			const cb = Callback.none<() => void>();

			expect(() => cb.execute()).toThrow(InvalidStateException);
			expect(() => cb.execute()).toThrow(/no callback registered/u);
		});

		it('handover throws InvalidStateException with a descriptive message', () => {
			const cb = Callback.none<() => void>();

			expect(() => cb.handover()).toThrow(InvalidStateException);
			expect(() => cb.handover()).toThrow(/no callback registered/u);
		});

		it('executeOr runs the fallback and forwards the spread args', () => {
			const fallback = vi.fn((a: number, b: number): number => a + b);
			const cb = Callback.none<(a: number, b: number) => number>();

			expect(cb.executeOr(fallback, 4, 5)).toBe(9);
			expect(fallback).toHaveBeenCalledWith(4, 5);
		});

		it('handoverOr returns the fallback', () => {
			const fallback = (): number => 7;
			const cb = Callback.none<() => number>();

			expect(cb.handoverOr(fallback)).toBe(fallback);
		});
	});

	describe('Callback.from', () => {
		it('returns an existing callback when fn is defined', () => {
			const fn = vi.fn();
			const cb = Callback.from(fn);

			expect(cb.hasCallback).toBe(true);
			cb.execute();
			expect(fn).toHaveBeenCalledOnce();
		});

		it('returns a none callback when fn is undefined', () => {
			const cb = Callback.from<(n: number) => void>(undefined);

			expect(cb.hasCallback).toBe(false);
			expect(() => cb.execute(1)).toThrow(InvalidStateException);
		});
	});
});
